import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import ForumThread from '../src/models/ForumThread.js';
import ForumCategory from '../src/models/ForumCategory.js';
import User from '../src/models/User.js';
import forumRoutes from '../src/modules/forum/routes.js';

const app = express();
app.use(express.json());
app.use('/api/forum', forumRoutes);

let mongoServer;
let log;
let warn;
let author;
let category;

beforeAll(async () => {
  log = jest.spyOn(console, 'log').mockImplementation(() => {});
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  mongoServer = await MongoMemoryServer.create({ instance: { launchTimeout: 30000 } });
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
  log.mockRestore();
  warn.mockRestore();
});

beforeEach(async () => {
  await Promise.all([User, ForumThread, ForumCategory].map((model) => model.deleteMany({})));
  author = await User.create({ username: 'pin-author', password: 'test-password', email: 'pin-author@example.test' });
  category = await ForumCategory.create({ name: 'Pin category', slug: 'pin-category', status: 'approved' });

  const now = Date.now();
  await ForumThread.create([
    {
      authorId: author._id, categoryId: category._id, title: 'Pinned old thread', content: 'Pinned content.',
      pinned: true, createdAt: new Date(now - 5 * 86400000), lastActivityAt: new Date(now - 5 * 86400000),
    },
    {
      authorId: author._id, categoryId: category._id, title: 'Fresh thread', content: 'Fresh content.',
      createdAt: new Date(now - 60000), lastActivityAt: new Date(now - 60000),
    },
  ]);
});

const titles = (body) => body.threads.map((thread) => thread.title);

test('pinned threads float to the top only on a category feed', async () => {
  const globalFeed = await request(app).get('/api/forum/threads').query({ sort: 'latest' });
  expect(globalFeed.status).toBe(200);
  expect(titles(globalFeed.body)).toEqual(['Fresh thread', 'Pinned old thread']);

  const categoryFeed = await request(app).get('/api/forum/threads').query({ sort: 'latest', categorySlug: 'pin-category' });
  expect(categoryFeed.status).toBe(200);
  expect(titles(categoryFeed.body)).toEqual(['Pinned old thread', 'Fresh thread']);
});
