import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import ForumThread from '../src/models/ForumThread.js';
import ForumCategory from '../src/models/ForumCategory.js';
import Membership, { MEMBERSHIP_TIER_IDS } from '../src/models/Membership.js';
import User from '../src/models/User.js';
import forumRoutes from '../src/modules/forum/routes.js';

const app = express();
app.use(express.json());
app.use('/api/forum', forumRoutes);

const secret = 'forum-boost-test-key';
const auth = (user) => `Bearer ${jwt.sign({ id: String(user._id) }, secret)}`;

let mongoServer;
let log;
let warn;
let error;

beforeAll(async () => {
  process.env.JWT_SECRET = secret;
  log = jest.spyOn(console, 'log').mockImplementation(() => {});
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  error = jest.spyOn(console, 'error').mockImplementation(() => {});
  mongoServer = await MongoMemoryServer.create({ instance: { launchTimeout: 30000 } });
  await mongoose.connect(mongoServer.getUri());
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
  log.mockRestore();
  warn.mockRestore();
  error.mockRestore();
});

test('boosting a member thread returns it boosted and moves it to the top of the list', async () => {
  await Promise.all([User, ForumThread, ForumCategory, Membership].map((model) => model.deleteMany({})));
  const member = await User.create({ username: 'booster', password: 'test-password', email: 'booster@example.test' });
  const other = await User.create({ username: 'other', password: 'test-password', email: 'other@example.test' });
  const category = await ForumCategory.create({ name: 'Boost category', slug: 'boost-category', status: 'approved' });
  const now = Date.now();

  await Membership.create({
    userId: member._id,
    tier: MEMBERSHIP_TIER_IDS[0],
    status: 'active',
    startedAt: new Date(now - 86400000),
    renewsAt: new Date(now + 30 * 86400000),
    boostsUsed: 0,
  });
  const mine = await ForumThread.create({
    authorId: member._id, categoryId: category._id, title: 'Older member thread', content: 'Member content.',
    createdAt: new Date(now - 3600000), lastActivityAt: new Date(now - 3600000),
  });
  await ForumThread.create({
    authorId: other._id, categoryId: category._id, title: 'Newer other thread', content: 'Other content.',
    createdAt: new Date(now - 60000), lastActivityAt: new Date(now - 60000),
  });

  const boost = await request(app).post(`/api/forum/threads/${mine._id}/boost`).set('Authorization', auth(member));
  expect(boost.status).toBe(200);
  expect(boost.body.thread.isBoosted).toBe(true);
  expect(boost.body.boostsRemaining).toBeGreaterThanOrEqual(0);

  const list = await request(app).get('/api/forum/threads').query({ sort: 'latest' });
  expect(list.status).toBe(200);
  expect(list.body.threads.map((thread) => thread.title)).toEqual(['Older member thread', 'Newer other thread']);
  expect(list.body.threads[0].isBoosted).toBe(true);
  expect(list.body.threads[1].isBoosted).toBe(false);
});
