import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Membership from '../src/models/Membership.js';
import ForumThread from '../src/models/ForumThread.js';
import ForumReply from '../src/models/ForumReply.js';
import ForumCategory from '../src/models/ForumCategory.js';
import forumRoutes from '../src/modules/forum/routes.js';
import { MEMBERSHIP_TIERS } from '../src/modules/membership/membershipCatalog.js';

const app = express();
app.use(express.json());
app.use('/api/forum', forumRoutes);

const secret = 'forum-edit-perks-test-signing-key';
const previousSecret = process.env.JWT_SECRET;
const attachment = { url: 'https://example.test/a.png', key: 'k', kind: 'image', mimeType: 'image/png', size: 10 };
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
  await Promise.all([User, Membership, ForumThread, ForumReply, ForumCategory].map((model) => model.deleteMany({})));
  errorLog.mockClear();
});

test.each(Object.keys(MEMBERSHIP_TIERS))('%s members can edit their thread and reply', async (tier) => {
  const user = await User.create({
    username: `editor-${tier}`,
    password: 'test-password',
    email: `editor-${tier}@example.test`,
    accountType: 'provider',
  });
  await Membership.create({ userId: user._id, tier, status: 'active', renewsAt: new Date(Date.now() + 86400000) });
  const category = await ForumCategory.create({ name: 'Edits', slug: `edits-${tier}`, status: 'approved' });
  const token = `Bearer ${jwt.sign({ id: String(user._id) }, secret)}`;

  const thread = await ForumThread.create({
    authorId: user._id, categoryId: category._id, title: 'Plain title', content: 'Plain content here.',
  });
  const imageThread = await ForumThread.create({
    authorId: user._id, categoryId: category._id, title: 'Image title', content: 'Image content here.', attachments: [attachment],
  });
  const reply = await ForumReply.create({ threadId: thread._id, authorId: user._id, content: 'Reply text here' });

  const threadRes = await request(app).patch(`/api/forum/threads/${thread._id}`).set('Authorization', token)
    .send({ title: 'Edited title', content: 'Edited content body.' });
  const imageThreadRes = await request(app).patch(`/api/forum/threads/${imageThread._id}`).set('Authorization', token)
    .send({ title: 'Edited image title', content: 'Edited image content.' });
  const replyRes = await request(app).patch(`/api/forum/replies/${reply._id}`).set('Authorization', token)
    .send({ content: 'Edited reply' });

  expect(threadRes.status).toBe(200);
  expect(threadRes.body.title).toBe('Edited title');
  expect(imageThreadRes.status).toBe(200);
  expect(replyRes.status).toBe(200);
  expect(replyRes.body.content).toBe('Edited reply');
  expect(errorLog).not.toHaveBeenCalled();
});

test('members without an editing perk are refused with the membership prompt', async () => {
  const user = await User.create({
    username: 'free-editor', password: 'test-password', email: 'free-editor@example.test', accountType: 'provider',
  });
  const category = await ForumCategory.create({ name: 'Free', slug: 'free-edits', status: 'approved' });
  const thread = await ForumThread.create({
    authorId: user._id, categoryId: category._id, title: 'Free title', content: 'Free content here.',
  });
  const token = `Bearer ${jwt.sign({ id: String(user._id) }, secret)}`;

  const res = await request(app).patch(`/api/forum/threads/${thread._id}`).set('Authorization', token)
    .send({ title: 'Edited title', content: 'Edited content body.' });

  expect(res.status).toBe(403);
  expect(res.body).toMatchObject({ upgradeRequired: true });
});
