import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import ForumThread from '../src/models/ForumThread.js';
import ForumReply from '../src/models/ForumReply.js';
import ForumCategory from '../src/models/ForumCategory.js';
import Notification from '../src/models/Notification.js';
import forumRoutes from '../src/modules/forum/routes.js';

const app = express();
app.use(express.json());
app.use('/api/forum', forumRoutes);

const secret = 'forum-mention-test-signing-key';
const previousSecret = process.env.JWT_SECRET;
let mongoServer;
let errorLog;

beforeAll(async () => {
  process.env.JWT_SECRET = secret;
  errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
  mongoServer = await MongoMemoryServer.create({ instance: { launchTimeout: 30000 } });
  await mongoose.connect(mongoServer.getUri());
}, 60000);

afterAll(async () => {
  process.env.JWT_SECRET = previousSecret;
  errorLog.mockRestore();
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await Promise.all([User, ForumThread, ForumReply, ForumCategory, Notification].map((m) => m.deleteMany({})));
});

test('an @mention in a new thread or reply creates a forum_mention notification with the thread link', async () => {
  const [author, mentioned] = await Promise.all([
    User.create({ username: 'mention_author', password: 'test-password', email: 'author@example.test', accountType: 'provider' }),
    User.create({ username: 'mention_target', password: 'test-password', email: 'target@example.test', accountType: 'provider' }),
  ]);
  const category = await ForumCategory.create({ name: 'Mentions', slug: 'mentions', status: 'approved' });
  const token = `Bearer ${jwt.sign({ id: String(author._id) }, secret)}`;

  const created = await request(app).post('/api/forum/threads').set('Authorization', token)
    .send({ title: 'Hello there', content: 'Hey @mention_target, what do you think?', categoryId: String(category._id) });
  expect(created.status).toBe(201);

  const threadAlert = await Notification.findOne({ userId: mentioned._id, type: 'forum_mention' }).lean();
  expect(threadAlert).toBeTruthy();
  expect(threadAlert.meta.threadId).toBe(created.body.id);

  const reply = await request(app).post(`/api/forum/threads/${created.body.id}/replies`).set('Authorization', token)
    .send({ content: 'Also @mention_target, see this.' });
  expect(reply.status).toBe(201);
  expect(await Notification.countDocuments({ userId: mentioned._id, type: 'forum_mention' })).toBe(2);
});

test('mention search suggests active usernames by prefix for signed-in users', async () => {
  const author = await User.create({ username: 'search_author', password: 'test-password', email: 'sa@example.test', accountType: 'provider' });
  await User.create({ username: 'marcus_one', password: 'test-password', email: 'm1@example.test', accountType: 'provider' });
  await User.create({ username: 'Marcus_two', password: 'test-password', email: 'm2@example.test', accountType: 'provider', status: 'suspended' });
  const token = `Bearer ${jwt.sign({ id: String(author._id) }, secret)}`;

  const res = await request(app).get('/api/forum/users/mention-search').query({ q: 'mar' }).set('Authorization', token);
  expect(res.status).toBe(200);
  expect(res.body.users.map((u) => u.username)).toEqual(['marcus_one']);

  const anon = await request(app).get('/api/forum/users/mention-search').query({ q: 'mar' });
  expect(anon.status).toBe(401);
});
