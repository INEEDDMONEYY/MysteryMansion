import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Post from '../src/models/Post.js';
import postRoutes from '../src/modules/posts/routes.js';
import { orderBoostedFirst } from '../src/modules/posts/postBoost.js';

const app = express();
app.use(express.json());
app.use('/api/posts', postRoutes);

const secret = 'profile-post-test-signing-key';
const previousSecret = process.env.JWT_SECRET;
const auth = (user) => `Bearer ${jwt.sign({ id: String(user._id) }, secret)}`;
let mongoServer;
let user;

beforeAll(async () => {
  process.env.JWT_SECRET = secret;
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  mongoServer = await MongoMemoryServer.create({ instance: { launchTimeout: 30000 } });
  await mongoose.connect(mongoServer.getUri());
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
  if (previousSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousSecret;
  jest.restoreAllMocks();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Post.deleteMany({})]);
  user = await User.create({
    username: 'poster', password: 'test-password', email: 'poster@example.test',
    city: 'Denver', state: 'Colorado', country: 'United States',
  });
});

test('posting a profile again adds a new profile post and keeps the earlier one', async () => {
  const first = await request(app).post('/api/posts').set('Authorization', auth(user))
    .send({ postType: 'profile', categories: ['Escorts'], city: 'Denver', state: 'CO' });
  expect(first.status).toBe(201);

  const second = await request(app).post('/api/posts').set('Authorization', auth(user))
    .send({ postType: 'profile', categories: ['Massage'], city: 'Denver', state: 'CO' });
  expect(second.status).toBe(201);
  expect(second.body._id).not.toBe(first.body._id);

  const profiles = await Post.find({ userId: user._id, postType: 'profile' }).lean();
  expect(profiles).toHaveLength(2);
  expect(profiles.map((post) => post.categories[0]).sort()).toEqual(['Escorts', 'Massage']);
});

test('feed lists live boosts first and ignores expired ones', async () => {
  const hour = 60 * 60 * 1000;
  const base = { userId: user._id, title: 'T', description: 'D', state: 'Colorado', city: 'Denver' };
  const [oldBoosted, expired, newest] = await Post.create([
    { ...base, title: 'old but boosted', boostedUntil: new Date(Date.now() + hour) },
    { ...base, title: 'expired boost', boostedUntil: new Date(Date.now() - hour) },
    { ...base, title: 'newest' },
  ]);
  await Post.updateOne({ _id: oldBoosted._id }, { $set: { createdAt: new Date(Date.now() - 3 * hour) } }, { timestamps: false });
  await Post.updateOne({ _id: expired._id }, { $set: { createdAt: new Date(Date.now() - 2 * hour) } }, { timestamps: false });

  const res = await request(app).get('/api/posts');
  expect(res.status).toBe(200);
  expect(res.body.map((post) => post.title)).toEqual(['old but boosted', 'newest', 'expired boost']);
  expect(String(res.body[1]._id)).toBe(String(newest._id));
});

test('orderBoostedFirst puts the most recent live boost first and keeps the rest in order', () => {
  const now = Date.now();
  const posts = [
    { id: 'a' },
    { id: 'b', boostedUntil: new Date(now + 1000) },
    { id: 'c', boostedUntil: new Date(now - 1000) },
    { id: 'd', boostedUntil: new Date(now + 5000) },
  ];
  expect(orderBoostedFirst(posts, now).map((post) => post.id)).toEqual(['d', 'b', 'a', 'c']);
});
