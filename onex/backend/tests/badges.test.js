import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Post from '../src/models/Post.js';
import Flag from '../src/models/Flag.js';
import Referral from '../src/models/Referral.js';
import ForumCategory from '../src/models/ForumCategory.js';
import ForumThread from '../src/models/ForumThread.js';
import ForumReply from '../src/models/ForumReply.js';
import { ForumVote } from '../src/models/ForumInteraction.js';
import { BADGE_CATALOG } from '../src/modules/badges/badgeCatalog.js';
import { computeBadgeStats, computeEarnedBadges, REPUTATION_POINTS } from '../src/modules/badges/badgeEngine.js';
import { recordDailyActivity } from '../src/common/middleware/authMiddleware.js';
import badgeRoutes from '../src/modules/badges/routes.js';
import { computeLegacyDefinitions } from '../src/modules/milestones/milestoneEngine.js';

const app = express();
app.use('/api/badges', badgeRoutes);

const DAY_MS = 24 * 60 * 60 * 1000;
let mongoServer;
let author;
let category;

const earnedIds = async (user, now) => (await computeEarnedBadges(user, now)).badges.map((badge) => badge.id);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({ instance: { launchTimeout: 30000 } });
  await mongoose.connect(mongoServer.getUri());
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await Promise.all([User, Post, Flag, Referral, ForumCategory, ForumThread, ForumReply, ForumVote]
    .map((model) => model.deleteMany({})));
  author = await User.create({
    username: 'author', password: 'test-password', email: 'author@example.test',
    createdAt: new Date(Date.now() - 46 * DAY_MS),
  });
  category = await ForumCategory.create({ name: 'Badges', slug: 'badges', status: 'approved' });
});

test('badge catalog covers 100 unique ids with matching tiers and thresholds', () => {
  expect(BADGE_CATALOG).toHaveLength(100);
  expect(new Set(BADGE_CATALOG.map((badge) => badge.id)).size).toBe(100);
  expect(BADGE_CATALOG.filter((badge) => badge.set === 'time')).toHaveLength(50);
  expect(BADGE_CATALOG.find((badge) => badge.id === 'days-1')).toMatchObject({ tier: 1, threshold: 1 });
});

test('time badges unlock from account age, starting on day one', async () => {
  const now = new Date();
  const fresh = await User.create({ username: 'fresh', password: 'test-password', email: 'fresh@example.test', createdAt: now });
  expect(await earnedIds(fresh, now)).toEqual([]);

  const oneDay = new Date(now.getTime() - DAY_MS - 1000);
  const dayOne = await User.create({ username: 'dayone', password: 'test-password', email: 'dayone@example.test', createdAt: oneDay });
  const ids = await earnedIds(dayOne, now);
  expect(ids).toContain('days-1');
  expect(ids).not.toContain('days-2');

  const stats = await computeBadgeStats(author, new Date());
  expect(stats.days).toBe(46);
  expect(await earnedIds(author)).toEqual(expect.arrayContaining(['days-1', 'days-30', 'days-45', 'months-1']));
  expect(await earnedIds(author)).not.toContain('days-60');
  expect(await earnedIds(author)).not.toContain('months-2');
});

test('forum and listing activity drive the matching badges', async () => {
  const thread = await ForumThread.create({
    authorId: author._id, categoryId: category._id, title: 'A thread', content: 'Thread body text.',
  });
  const reply = await ForumReply.create({ threadId: thread._id, authorId: author._id, content: 'A reply.' });
  await ForumReply.create({ threadId: thread._id, authorId: author._id, content: 'Deleted.', isDeleted: true });
  await ForumThread.updateOne({ _id: thread._id }, { solutionReplyId: reply._id });
  await Post.create({ userId: author._id, postType: 'profile' });

  const reader = await User.create({ username: 'reader', password: 'test-password', email: 'reader@example.test' });
  await ForumVote.create({ userId: reader._id, targetType: 'thread', targetId: thread._id, value: 1 });
  await ForumVote.create({ userId: author._id, targetType: 'thread', targetId: thread._id, value: 1 });

  const stats = await computeBadgeStats(author);
  expect(stats).toMatchObject({
    posts: 1, threads: 1, replies: 1, solutions: 1, likesReceived: 1, likesGiven: 1,
  });

  const ids = await earnedIds(author);
  expect(ids).toEqual(expect.arrayContaining(['posts-1', 'threads-1', 'replies-1', 'solutions-1', 'likes-given-1', 'likes-received-1']));
  expect(ids).not.toContain('replies-2');
});

test('reputation adds up likes, solutions and clean standing', async () => {
  const thread = await ForumThread.create({
    authorId: author._id, categoryId: category._id, title: 'Rep', content: 'Reputation body.',
  });
  const voters = await User.create([1, 2, 3].map((n) => ({
    username: `voter${n}`, password: 'test-password', email: `voter${n}@example.test`,
  })));
  await ForumVote.create(voters.map((voter) => ({ userId: voter._id, targetType: 'thread', targetId: thread._id, value: 1 })));

  const recent = (await computeLegacyDefinitions(author)).filter((m) => m.achieved);
  const base = 3 * REPUTATION_POINTS.likeReceived + recent.length * REPUTATION_POINTS.milestone;
  const stats = await computeBadgeStats(author);
  expect(stats.reputation).toBe(base + REPUTATION_POINTS.cleanStanding);
  expect(await earnedIds(author)).toEqual(expect.arrayContaining(['reputation-1']));
  expect(await earnedIds(author)).not.toContain('reputation-2');

  await Flag.create({
    reporterId: voters[0]._id, reportedUserId: author._id, targetType: 'user',
    targetId: author._id, reason: 'Spam', status: 'pending',
  });
  expect((await computeBadgeStats(author)).reputation).toBe(base);
});

test('invites and guardian reports come from referrals and resolved flags', async () => {
  await Referral.create({ providerId: author._id, code: 'ABC123', signupCount: 5 });
  const reporter = await User.create({ username: 'reporter', password: 'test-password', email: 'reporter@example.test' });
  await Flag.create({
    reporterId: author._id, reportedUserId: reporter._id, targetType: 'user',
    targetId: reporter._id, reason: 'Helpful', status: 'resolved',
  });

  const stats = await computeBadgeStats(author);
  expect(stats.invites).toBe(5);
  expect(stats.guardian).toBe(1);
  const ids = await earnedIds(author);
  expect(ids).toEqual(expect.arrayContaining(['invites-2', 'guardian-1']));
  expect(ids).not.toContain('invites-3');
});

test('daily activity extends streaks and resets after a missed day', async () => {
  const day = (offset) => new Date(Date.UTC(2025, 0, 10 + offset, 12));
  const user = await User.create({ username: 'streaker', password: 'test-password', email: 'streak@example.test' });
  const doc = await User.findById(user._id);

  recordDailyActivity(doc, day(0));
  await new Promise((resolve) => setTimeout(resolve, 50));
  recordDailyActivity(doc, day(0));
  recordDailyActivity(doc, day(1));
  await new Promise((resolve) => setTimeout(resolve, 50));
  let stored = await User.findById(user._id).lean();
  expect(stored.activity).toMatchObject({ lastDay: '2025-01-11', currentStreak: 2, longestStreak: 2 });

  const reloaded = await User.findById(user._id);
  recordDailyActivity(reloaded, day(4));
  await new Promise((resolve) => setTimeout(resolve, 50));
  stored = await User.findById(user._id).lean();
  expect(stored.activity).toMatchObject({ lastDay: '2025-01-14', currentStreak: 1, longestStreak: 2 });
  expect((await computeBadgeStats(stored)).streak).toBe(2);
});

test('public endpoint returns earned badges and hides missing or suspended profiles', async () => {
  const ok = await request(app).get(`/api/badges/${author._id}`);
  expect(ok.status).toBe(200);
  expect(ok.body.totalBadges).toBe(100);
  expect(ok.body.badges.map((badge) => badge.id)).toEqual(expect.arrayContaining(['days-1']));

  expect((await request(app).get('/api/badges/not-an-id')).status).toBe(404);
  expect((await request(app).get(`/api/badges/${new mongoose.Types.ObjectId()}`)).status).toBe(404);

  await User.updateOne({ _id: author._id }, { status: 'suspended' });
  expect((await request(app).get(`/api/badges/${author._id}`)).status).toBe(404);
});
