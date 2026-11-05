import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import ForumCategory from '../src/models/ForumCategory.js';
import { ForumVote } from '../src/models/ForumInteraction.js';
import forumRoutes from '../src/modules/forum/routes.js';

const app = express();
app.use(express.json());
app.use('/api/forum', forumRoutes);

let mongoServer;
let log;
let warn;

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
  await Promise.all([ForumCategory, ForumVote].map((model) => model.deleteMany({})));
});

describe('GET /api/forum/stats', () => {
  it('counts likes and approved categories, with new categories limited to the last 30 days', async () => {
    await ForumCategory.create({ name: 'Recent', slug: 'recent', status: 'approved' });
    const old = await ForumCategory.create({ name: 'Old', slug: 'old', status: 'approved' });
    await ForumCategory.create({ name: 'Pending', slug: 'pending', status: 'pending' });
    await ForumCategory.collection.updateOne(
      { _id: old._id },
      { $set: { createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) } },
    );

    const voter = new mongoose.Types.ObjectId();
    await ForumVote.create([
      { userId: voter, targetType: 'thread', targetId: new mongoose.Types.ObjectId(), value: 1 },
      { userId: voter, targetType: 'reply', targetId: new mongoose.Types.ObjectId(), value: 1 },
      { userId: voter, targetType: 'thread', targetId: new mongoose.Types.ObjectId(), value: -1 },
    ]);

    const res = await request(app).get('/api/forum/stats');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({
      totalLikes: 2,
      totalCategories: 2,
      newCategories: 1,
    }));
  });
});
