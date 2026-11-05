import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Post from '../src/models/Post.js';
import ForumCategory from '../src/models/ForumCategory.js';
import { RpLedger } from '../src/models/RpLedger.js';
import Notification from '../src/models/Notification.js';
import { MILESTONE_TIER_RP_RANGE, catalogMilestoneEventKey } from '../src/modules/progression/rpRules.js';
import { syncRpForUser } from '../src/modules/progression/rpEngine.js';
import { computeUserMilestones } from '../src/modules/milestones/milestoneEngine.js';

let mongoServer;
let category;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({ instance: { launchTimeout: 30000 } });
  await mongoose.connect(mongoServer.getUri());
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await Promise.all([User, Post, ForumCategory, RpLedger, Notification].map((model) => model.deleteMany({})));
  category = await ForumCategory.create({ name: 'General', slug: 'general', status: 'approved' });
});

const makeUser = (extra = {}) => User.create({
  username: `member${Math.random().toString(36).slice(2, 8)}`,
  password: 'test-password',
  email: `m${Math.random().toString(36).slice(2, 8)}@example.test`,
  accountType: 'client',
  ...extra,
});

const addPost = (userId, title) => Post.create({
  userId, categoryId: category._id, title, description: 'Short.', content: 'Body.',
});

const milestoneRow = (userId) => RpLedger.findOne({ userId, eventKey: catalogMilestoneEventKey('posts-1') }).lean();

test('an achieved catalog milestone pays random RP within its tier range', async () => {
  const user = await makeUser({ progression: { syncedAt: new Date(), catalogRewardsSyncedAt: new Date() } });
  await addPost(user._id, 'First');

  await syncRpForUser(user._id);

  const row = await milestoneRow(user._id);
  expect(row).toBeTruthy();
  expect(row.category).toBe('milestones');
  const [min, max] = MILESTONE_TIER_RP_RANGE[1];
  expect(row.points).toBeGreaterThanOrEqual(min);
  expect(row.points).toBeLessThanOrEqual(max);

  const { recent } = await computeUserMilestones(user);
  expect(recent.find((m) => m.id === 'posts-1')).toMatchObject({ rewardPoints: row.points });
});

test('re-syncing keeps the milestone reward amount fixed', async () => {
  const user = await makeUser({ progression: { syncedAt: new Date(), catalogRewardsSyncedAt: new Date() } });
  await addPost(user._id, 'First');

  await syncRpForUser(user._id);
  const first = await milestoneRow(user._id);
  await syncRpForUser(user._id);
  await syncRpForUser(user._id);

  expect(await RpLedger.countDocuments({ userId: user._id, eventKey: first.eventKey })).toBe(1);
  expect((await milestoneRow(user._id)).points).toBe(first.points);
});

test('the first catalog sync for an existing user pays RP silently', async () => {
  const user = await makeUser({ progression: { syncedAt: new Date() } });
  await addPost(user._id, 'First');

  await syncRpForUser(user._id);

  expect(await milestoneRow(user._id)).toBeTruthy();
  expect(await Notification.countDocuments({ userId: user._id, type: 'milestone_achieved' })).toBe(0);
  const refreshed = await User.findById(user._id).lean();
  expect(refreshed.progression.catalogRewardsSyncedAt).toBeTruthy();
});

test('a newly achieved catalog milestone notifies the user with its title and RP', async () => {
  const user = await makeUser({ progression: { syncedAt: new Date(), catalogRewardsSyncedAt: new Date() } });
  await addPost(user._id, 'First');

  await syncRpForUser(user._id);

  const [note] = await Notification.find({ userId: user._id, type: 'milestone_achieved' }).lean();
  const row = await milestoneRow(user._id);
  expect(note).toBeTruthy();
  expect(note.title).toBe('Milestone achieved!');
  expect(note.message).toContain('"Fresh Quill"');
  expect(note.message).toContain(`${row.points} RP`);
  expect(note.meta).toMatchObject({ milestoneId: 'posts-1', points: row.points });
});

test('admins do not earn catalog milestone rewards', async () => {
  const admin = await makeUser({ role: 'admin', accountType: 'client', progression: { syncedAt: new Date() } });
  await addPost(admin._id, 'First');

  await syncRpForUser(admin._id);

  expect(await milestoneRow(admin._id)).toBeNull();
});
