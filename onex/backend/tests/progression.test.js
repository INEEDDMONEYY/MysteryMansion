import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Post from '../src/models/Post.js';
import Review from '../src/models/Review.js';
import Referral from '../src/models/Referral.js';
import EmailVerification from '../src/models/EmailVerification.js';
import ForumCategory from '../src/models/ForumCategory.js';
import ForumThread from '../src/models/ForumThread.js';
import ForumReply from '../src/models/ForumReply.js';
import { ForumFollow } from '../src/models/ForumInteraction.js';
import { RpLedger } from '../src/models/RpLedger.js';
import Notification from '../src/models/Notification.js';
import { MAX_LEVEL, levelForRp, levelThreshold } from '../src/modules/progression/rpRules.js';
import { awardDailyLogin, awardRp, getProgression, syncRpForUser } from '../src/modules/progression/rpEngine.js';
import progressionRoutes from '../src/modules/progression/routes.js';

const app = express();
app.use('/api/progression', progressionRoutes);

let mongoServer;
let user;
let category;

const ledgerTotal = async (userId) => {
  const [row] = await RpLedger.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: '$points' } } },
  ]);
  return row?.total ?? 0;
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({ instance: { launchTimeout: 30000 } });
  await mongoose.connect(mongoServer.getUri());
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await Promise.all([User, Post, Review, Referral, EmailVerification, ForumCategory, ForumThread, ForumReply, ForumFollow, RpLedger]
    .map((model) => model.deleteMany({})));
  user = await User.create({
    username: 'member', password: 'test-password', email: 'member@example.test', accountType: 'client',
  });
  category = await ForumCategory.create({ name: 'Talk', slug: 'talk', status: 'approved' });
});

test('level curve starts at level 1 and reaches the max at 50,000 RP', () => {
  expect(levelThreshold(1)).toBe(0);
  expect(levelThreshold(MAX_LEVEL)).toBe(50000);
  expect(levelForRp(0)).toBe(1);
  expect(levelForRp(50000)).toBe(MAX_LEVEL);
  expect(levelForRp(10_000_000)).toBe(MAX_LEVEL);
  for (let level = 2; level <= MAX_LEVEL; level += 1) {
    expect(levelThreshold(level)).toBeGreaterThan(levelThreshold(level - 1));
  }
});

test('awardRp is idempotent per event key', async () => {
  const entry = { eventKey: 'thread:abc', category: 'forum', label: 'Thread', points: 10 };
  expect(await awardRp(user._id, [entry])).toBe(10);
  expect(await awardRp(user._id, [entry])).toBe(0);
  expect(await RpLedger.countDocuments({ userId: user._id })).toBe(1);
});

test('daily login awards once per UTC day', async () => {
  const first = await awardDailyLogin(user._id, new Date('2025-03-01T08:00:00Z'));
  const repeat = await awardDailyLogin(user._id, new Date('2025-03-01T20:00:00Z'));
  const nextDay = await awardDailyLogin(user._id, new Date('2025-03-02T01:00:00Z'));
  expect([first, repeat, nextDay]).toEqual([5, 0, 5]);
  expect(await ledgerTotal(user._id)).toBe(10);
});

test('sync backfills past activity and never double counts on re-run', async () => {
  await EmailVerification.create({ email: user.email, verified: true, codeHash: 'hash', expiresAt: new Date(Date.now() + 3600e3) });
  const thread = await ForumThread.create({
    authorId: user._id, categoryId: category._id, title: 'Old thread', content: 'Body text.',
  });
  await Post.create({ userId: user._id, postType: 'listing', title: 'Listing', description: 'Desc', city: 'Austin', state: 'Texas', country: 'United States' });
  await Post.create({ userId: user._id, postType: 'profile' });

  await syncRpForUser(user._id);
  const first = await RpLedger.find({ userId: user._id }).lean();
  const pointsFor = (prefix) => first.filter((row) => row.eventKey.startsWith(prefix)).reduce((s, r) => s + r.points, 0);
  // Thread 10, listing 15, profile card 20, email verified 25.
  expect(pointsFor('thread:')).toBe(10);
  expect(pointsFor('listing:')).toBe(15);
  expect(pointsFor('profile-card:')).toBe(20);
  expect(pointsFor('email-verified')).toBe(25);

  const totalBefore = await ledgerTotal(user._id);
  await syncRpForUser(user._id);
  expect(await ledgerTotal(user._id)).toBe(totalBefore);
  expect(await RpLedger.countDocuments({ userId: user._id, eventKey: `thread:${thread._id}` })).toBe(1);
});

test('forum replies earn RP only when substantive and capped at 10 per day', async () => {
  const thread = await ForumThread.create({
    authorId: user._id, categoryId: category._id, title: 'Chat', content: 'Body text.',
  });
  const day = new Date('2025-02-10T12:00:00Z');
  const substantive = Array.from({ length: 12 }, (_, i) => ({
    threadId: thread._id,
    authorId: user._id,
    content: `A thoughtful reply number ${i}.`,
    createdAt: new Date(day.getTime() + i * 60000),
  }));
  await ForumReply.collection.insertMany(substantive.map((doc) => ({ ...doc, updatedAt: doc.createdAt, attachments: [], isDeleted: false, upvoteCount: 0 })));
  await ForumReply.create({ threadId: thread._id, authorId: user._id, content: 'ok' });

  await syncRpForUser(user._id);
  expect(await RpLedger.countDocuments({ userId: user._id, category: 'forum', eventKey: /^reply:/ })).toBe(10);
  const forumPoints = await RpLedger.aggregate([
    { $match: { userId: user._id, category: 'forum' } },
    { $group: { _id: null, total: { $sum: '$points' } } },
  ]);
  // Thread 10 plus 10 capped replies at 2 each.
  expect(forumPoints[0].total).toBe(30);
});

test('getProgression returns level, next threshold, and breakdown', async () => {
  await awardRp(user._id, [{ eventKey: 'a', category: 'forum', label: 'A', points: 60 }]);
  const progression = await getProgression(user._id);
  expect(progression.rp).toBeGreaterThanOrEqual(60);
  expect(progression.level).toBe(levelForRp(progression.rp));
  expect(progression.nextLevelRp).toBe(levelThreshold(progression.level + 1));
  expect(progression.breakdown.find((row) => row.category === 'forum')).toBeTruthy();
});

test('admin accounts always report the max level', async () => {
  const admin = await User.create({
    username: 'boss', password: 'test-password', email: 'boss@example.test', accountType: 'provider', role: 'admin',
  });
  const progression = await getProgression(admin._id);
  expect(progression.level).toBe(MAX_LEVEL);
  expect(progression.rp).toBe(levelThreshold(MAX_LEVEL));
  expect(progression.nextLevelRp).toBeNull();
  expect(progression.levelProgress).toBe(1);
});

test('RP awards notify once for XP earned and for a new level', async () => {
  const threshold = levelThreshold(2);
  await awardRp(user._id, [{ eventKey: 'seed', category: 'seed', label: 'Seed', points: threshold - 5 }]);
  await User.updateOne({ _id: user._id }, { $set: { 'progression.rp': threshold - 5 } });
  await awardDailyLogin(user._id, new Date('2030-01-01T12:00:00Z'));
  await awardDailyLogin(user._id, new Date('2030-01-01T13:00:00Z'));
  const xp = await Notification.find({ userId: user._id, type: 'rp_earned' }).lean();
  expect(xp).toHaveLength(1);
  expect(xp[0].title).toBe('+5 RP earned');
  const levels = await Notification.find({ userId: user._id, type: 'level_up' }).lean();
  expect(levels).toHaveLength(1);
  expect(levels[0].meta.level).toBe(2);
});

test('the first sync backfills history silently', async () => {
  await syncRpForUser(user._id);
  expect(await Notification.countDocuments({ userId: user._id, type: { $in: ['rp_earned', 'level_up'] } })).toBe(0);
});

test('public progression endpoint serves active profiles and hides missing or suspended ones', async () => {
  const ok = await request(app).get(`/api/progression/${user._id}`);
  expect(ok.status).toBe(200);
  expect(ok.body).toMatchObject({ level: expect.any(Number), maxLevel: MAX_LEVEL });

  const bad = await request(app).get('/api/progression/not-an-id');
  expect(bad.status).toBe(404);

  await User.updateOne({ _id: user._id }, { status: 'suspended' });
  const suspended = await request(app).get(`/api/progression/${user._id}`);
  expect(suspended.status).toBe(404);
});
