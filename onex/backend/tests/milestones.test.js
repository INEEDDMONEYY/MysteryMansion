import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Post from '../src/models/Post.js';
import ForumCategory from '../src/models/ForumCategory.js';
import { BADGE_CATALOG } from '../src/modules/badges/badgeCatalog.js';
import { computeUserMilestones } from '../src/modules/milestones/milestoneEngine.js';

const DAY_MS = 24 * 60 * 60 * 1000;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({ instance: { launchTimeout: 30000 } });
  await mongoose.connect(mongoServer.getUri());
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await Promise.all([User, Post, ForumCategory].map((model) => model.deleteMany({})));
});

test('members get the badge catalog with capped progress toward each threshold', async () => {
  const member = await User.create({
    username: 'member', password: 'test-password', email: 'member@example.test',
    createdAt: new Date(Date.now() - 6 * DAY_MS),
  });
  const category = await ForumCategory.create({ name: 'General', slug: 'general', status: 'approved' });
  await Post.create({ userId: member._id, categoryId: category._id, title: 'Hi', description: 'Short.', content: 'Body.' });

  const { recent, new: upcoming, definitions } = await computeUserMilestones(member);
  const ids = definitions.map((m) => m.id);

  expect(definitions).toHaveLength(BADGE_CATALOG.length);
  expect(ids).toEqual(expect.arrayContaining(['posts-1', 'days-1', 'years-50']));
  expect(ids).not.toContain('get-started');
  expect(recent.map((m) => m.id)).toEqual(expect.arrayContaining(['posts-1', 'days-5']));
  expect(upcoming.map((m) => m.id)).toContain('posts-2');

  const posts2 = definitions.find((m) => m.id === 'posts-2');
  expect(posts2).toMatchObject({ achieved: false, progress: 1, target: 10 });
});

test('admins keep the built-in milestone list', async () => {
  const admin = await User.create({
    username: 'boss', password: 'test-password', email: 'boss@example.test', role: 'admin', accountType: 'client',
    createdAt: new Date(),
  });

  const { definitions } = await computeUserMilestones(admin);
  const ids = definitions.map((m) => m.id);

  expect(ids).toEqual(expect.arrayContaining(['get-started', 'discover', 'engage', 'build-progress']));
  expect(ids).not.toContain('posts-1');
});
