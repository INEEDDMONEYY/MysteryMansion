import mongoose from 'mongoose';
import User from '../../models/User.js';
import Post from '../../models/Post.js';
import Review from '../../models/Review.js';
import Referral from '../../models/Referral.js';
import EmailVerification from '../../models/EmailVerification.js';
import ForumThread from '../../models/ForumThread.js';
import ForumReply from '../../models/ForumReply.js';
import { ForumFollow } from '../../models/ForumInteraction.js';
import { RpLedger } from '../../models/RpLedger.js';
import { profileCompleteness, computeUserMilestones } from '../milestones/milestoneEngine.js';
import { computeEarnedBadges } from '../badges/badgeEngine.js';
import {
  ACHIEVEMENT_TIER_RP,
  FORUM_REPLY_MIN_LENGTH,
  MAX_LEVEL,
  RP_AT_MAX_LEVEL,
  RP_RULES,
  levelForRp,
  levelThreshold,
} from './rpRules.js';

const SYNC_TTL_MS = 60 * 60 * 1000;
const PROFILE_FIELD_COUNT = 7;

const dayKey = (date) => new Date(date).toISOString().slice(0, 10);

function ruleEntry(ruleKey, eventKey, label = RP_RULES[ruleKey].label, points = RP_RULES[ruleKey].points) {
  return { eventKey, category: RP_RULES[ruleKey].category, label, points };
}

// Docs must be sorted oldest first so the earliest events in each day take the cap.
function capPerDay(docs, cap) {
  const counts = new Map();
  return docs.filter((doc) => {
    const day = dayKey(doc.createdAt);
    const used = counts.get(day) ?? 0;
    if (used >= cap) return false;
    counts.set(day, used + 1);
    return true;
  });
}

function isDuplicateKeyOnly(err) {
  const writeErrors = Array.isArray(err?.writeErrors) ? err.writeErrors : [];
  return writeErrors.length > 0 && writeErrors.every((e) => (e.code ?? e.err?.code) === 11000);
}

/**
 * Writes ledger rows, skipping any (userId, eventKey) that already exists.
 * Duplicate-key errors from concurrent requests are expected and ignored.
 */
export async function awardRp(userId, entries) {
  if (!entries.length) return 0;
  const docs = entries.map((e) => ({ userId, ...e }));
  try {
    await RpLedger.insertMany(docs, { ordered: false });
    return docs.reduce((sum, d) => sum + d.points, 0);
  } catch (err) {
    if (!isDuplicateKeyOnly(err)) throw err;
    const inserted = Array.isArray(err.insertedDocs) ? err.insertedDocs : [];
    return inserted.reduce((sum, d) => sum + d.points, 0);
  }
}

/** Recomputes the cached RP total from the ledger, which is the source of truth. */
async function refreshCachedRp(userId) {
  const [row] = await RpLedger.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: '$points' } } },
  ]);
  const total = row?.total ?? 0;
  await User.updateOne({ _id: userId }, { $set: { 'progression.rp': total } });
  return total;
}

/** Awards the daily login once per UTC day. Called from the auth middleware. */
export async function awardDailyLogin(userId, now = new Date()) {
  const key = `daily-login:${dayKey(now)}`;
  const awarded = await awardRp(userId, [ruleEntry('dailyLogin', key)]);
  if (awarded) await refreshCachedRp(userId);
  return awarded;
}

/**
 * Derives every RP-earning event from existing data and awards any that are
 * missing. Safe to run repeatedly: each event has a stable key, so it is only
 * ever awarded once. Also backfills activity that happened before this system.
 */
export async function syncRpForUser(userId) {
  const user = await User.findById(userId);
  if (!user) return null;

  const [posts, reviewsIn, reviewsOut, threads, replies, follows, emailVerified, milestones, badges, referral] =
    await Promise.all([
      Post.find({ userId }).select('postType').lean(),
      Review.find({ targetUserId: userId }).select('_id').lean(),
      Review.find({ authorUserId: userId }).select('_id').lean(),
      ForumThread.find({ authorId: userId, archived: { $ne: true } }).select('_id').lean(),
      ForumReply.find({ authorId: userId, isDeleted: { $ne: true } })
        .select('content createdAt')
        .sort({ createdAt: 1, _id: 1 })
        .lean(),
      ForumFollow.find({ userId, following: true }).select('createdAt').sort({ createdAt: 1, _id: 1 }).lean(),
      EmailVerification.exists({ email: user.email, verified: true }),
      computeUserMilestones(user),
      computeEarnedBadges(user),
      Referral.findOne({ providerId: userId }).select('signupCount').lean(),
    ]);

  const entries = [];

  if (profileCompleteness(user) >= PROFILE_FIELD_COUNT) {
    entries.push(ruleEntry('profileComplete', 'profile-complete'));
  }
  if (emailVerified) entries.push(ruleEntry('emailVerified', 'email-verified'));

  for (const post of posts) {
    if (post.postType === 'profile') {
      entries.push(ruleEntry('profileCardPublished', `profile-card:${post._id}`));
    } else {
      entries.push(ruleEntry('listingPublished', `listing:${post._id}`));
    }
  }

  for (const review of reviewsIn) entries.push(ruleEntry('reviewReceived', `review-received:${review._id}`));
  for (const review of reviewsOut) entries.push(ruleEntry('reviewSubmitted', `review-submitted:${review._id}`));
  for (const thread of threads) entries.push(ruleEntry('forumThreadCreated', `thread:${thread._id}`));

  const substantiveReplies = replies.filter((r) => (r.content || '').trim().length >= FORUM_REPLY_MIN_LENGTH);
  for (const reply of capPerDay(substantiveReplies, RP_RULES.forumReplyCreated.dailyCap)) {
    entries.push(ruleEntry('forumReplyCreated', `reply:${reply._id}`));
  }

  for (const follow of capPerDay(follows, RP_RULES.forumFollow.dailyCap)) {
    entries.push(ruleEntry('forumFollow', `follow:${follow._id}`));
  }

  for (const milestone of milestones.recent) {
    entries.push(ruleEntry('milestoneComplete', `milestone:${milestone.id}`, `Milestone: ${milestone.title}`));
  }

  for (const badge of badges.badges) {
    const points = ACHIEVEMENT_TIER_RP[badge.tier];
    if (points) entries.push({ eventKey: `badge:${badge.id}`, category: 'achievements', label: `Achievement: ${badge.title}`, points });
  }

  const signups = referral?.signupCount ?? 0;
  for (let n = 1; n <= signups; n += 1) {
    entries.push(ruleEntry('referralSignup', `referral:${n}`));
  }

  await awardRp(userId, entries);
  const total = await refreshCachedRp(userId);
  await User.updateOne({ _id: userId }, { $set: { 'progression.syncedAt': new Date() } });
  return total;
}

/**
 * Returns the current RP, level, and per-category breakdown. Re-syncs when the
 * cache is missing or older than SYNC_TTL_MS, so historical activity shows up.
 */
export async function getProgression(userId) {
  const user = await User.findById(userId).select('progression role').lean();
  if (!user) return null;

  const syncedAt = user.progression?.syncedAt ? new Date(user.progression.syncedAt).getTime() : 0;
  if (Date.now() - syncedAt > SYNC_TTL_MS) {
    await syncRpForUser(userId);
  }

  const breakdown = await RpLedger.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$category', points: { $sum: '$points' }, count: { $sum: 1 } } },
    { $sort: { points: -1 } },
  ]);

  const breakdownRows = breakdown.map((row) => ({ category: row._id, points: row.points, count: row.count }));

  // Admin accounts always display the top level, regardless of earned RP.
  if (user.role === 'admin') {
    return {
      rp: RP_AT_MAX_LEVEL,
      level: MAX_LEVEL,
      maxLevel: MAX_LEVEL,
      levelStartRp: RP_AT_MAX_LEVEL,
      nextLevelRp: null,
      levelProgress: 1,
      breakdown: breakdownRows,
    };
  }

  const rp = breakdown.reduce((sum, row) => sum + row.points, 0);
  const level = levelForRp(rp);
  const levelStartRp = levelThreshold(level);
  const nextLevelRp = level < MAX_LEVEL ? levelThreshold(level + 1) : null;

  return {
    rp,
    level,
    maxLevel: MAX_LEVEL,
    levelStartRp,
    nextLevelRp,
    levelProgress: nextLevelRp
      ? Math.min(1, (rp - levelStartRp) / (nextLevelRp - levelStartRp))
      : 1,
    breakdown: breakdownRows,
  };

}

/** Fire-and-forget sync for write paths so user requests never wait on RP bookkeeping. */
export function syncRpInBackground(userId) {
  syncRpForUser(userId).catch((err) => {
    console.error('[progression] RP sync failed', userId, err?.message || err);
  });
}
