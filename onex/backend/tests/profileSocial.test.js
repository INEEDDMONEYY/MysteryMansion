import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import User from '../src/models/User.js';
import UserFollow from '../src/models/UserFollow.js';
import socialRoutes from '../src/modules/users/socialRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/social', socialRoutes);
const secret = 'profile-social-test-secret';
const previousSecret = process.env.JWT_SECRET;
const auth = (user) => `Bearer ${jwt.sign({ id: String(user._id) }, secret)}`;
const follow = (from, to, following = true) => request(app).put(`/api/social/${to._id}/follow`)
  .set('Authorization', auth(from)).send({ following });
const summary = (owner, viewer) => {
  const req = request(app).get(`/api/social/${owner._id}`);
  return viewer ? req.set('Authorization', auth(viewer)) : req;
};
let mongo;
let admin;
let provider;
let client;

beforeAll(async () => {
  process.env.JWT_SECRET = secret;
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 30000 } });
  await mongoose.connect(mongo.getUri());
  await UserFollow.init();
}, 60000);
afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
  if (previousSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousSecret;
  jest.restoreAllMocks();
});
beforeEach(async () => {
  await Promise.all([User.deleteMany({}), UserFollow.deleteMany({})]);
  [admin, provider, client] = await User.create([
    { username: 'Admin', role: 'admin' },
    { username: 'Provider', accountType: 'provider' },
    { username: 'Client', accountType: 'client' },
  ].map((user) => ({ ...user, password: 'test-password', email: `${user.username}@example.test` })));
});

test('all admins are default mutual friends for existing and new clients and providers', async () => {
  for (const user of [provider, client]) {
    const res = await summary(user, admin);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ friendCount: 1, followingCount: 1, followerCount: 1 });
    expect(res.body.friends[0]._id).toBe(String(admin._id));
    expect(res.body.viewer).toMatchObject({ following: true, followedBy: true, isFriend: true });
    expect(res.body.friends[0].email).toBeUndefined();
    expect(res.body.friends[0].password).toBeUndefined();
  }
  const fresh = await User.create({ username: 'Fresh', password: 'test-password' });
  expect((await summary(fresh)).body.friendCount).toBe(1);
  const newAdmin = await User.create({ username: 'NewAdmin', role: 'admin', password: 'test-password' });
  expect((await summary(provider)).body.friendCount).toBe(2);
  expect((await summary(newAdmin)).body.friendCount).toBe(4);
});

test('one-way follows become friends only after a reciprocal follow', async () => {
  expect((await follow(provider, client)).status).toBe(200);
  let res = await summary(client, provider);
  expect(res.body.viewer).toMatchObject({ following: true, followedBy: false, isFriend: false });
  expect(res.body.friendCount).toBe(1);
  expect((await follow(client, provider)).status).toBe(200);
  res = await summary(client, provider);
  expect(res.body.viewer.isFriend).toBe(true);
  expect(res.body.friendCount).toBe(2);
  await follow(provider, client, false);
  expect((await summary(client, provider)).body.viewer).toMatchObject({ following: false, followedBy: true, isFriend: false });
});

test('explicit admin unfollows persist and a follow restores friendship', async () => {
  await follow(provider, admin, false);
  for (let i = 0; i < 2; i++) {
    expect((await summary(provider)).body.friendCount).toBe(0);
    expect((await summary(admin, provider)).body.viewer.following).toBe(false);
  }
  expect((await UserFollow.findOne({ followerId: provider._id, followedId: admin._id }).lean()).following).toBe(false);
  await follow(provider, admin);
  expect((await summary(provider)).body.friendCount).toBe(1);
  await follow(admin, provider, false);
  expect((await summary(provider)).body.friendCount).toBe(0);
});

test('rejects anonymous, self, invalid, and suspended follows', async () => {
  expect((await request(app).put(`/api/social/${provider._id}/follow`).send({ following: true })).status).toBe(401);
  expect((await follow(provider, provider)).status).toBe(400);
  expect((await request(app).put(`/api/social/${String(provider._id).toUpperCase()}/follow`)
    .set('Authorization', auth(provider)).send({ following: true })).status).toBe(400);
  expect((await request(app).put(`/api/social/${client._id}/follow`).set('Authorization', auth(provider)).send({ following: 'true' })).status).toBe(400);
  expect((await request(app).get('/api/social/invalid')).status).toBe(404);
  await User.updateOne({ _id: client._id }, { $set: { status: 'suspended' } });
  expect((await follow(provider, client)).status).toBe(404);
  expect((await follow(client, provider)).status).toBe(403);
});

test('suspended and deleted accounts are excluded from friends and counts', async () => {
  await follow(provider, client);
  await follow(client, provider);
  await User.updateOne({ _id: client._id }, { $set: { status: 'suspended' } });
  expect((await summary(provider)).body.friendCount).toBe(1);
  await User.deleteOne({ _id: admin._id });
  const res = await summary(provider);
  expect(res.body.friendCount).toBe(0);
  expect(res.body.followingCount).toBe(0);
  expect(res.body.followerCount).toBe(0);
});

test('repeated concurrent follows are idempotent and friend lists are paginated', async () => {
  await Promise.all([follow(provider, client), follow(provider, client), follow(provider, client)]);
  expect(await UserFollow.countDocuments({ followerId: provider._id, followedId: client._id })).toBe(1);
  await User.create(Array.from({ length: 25 }, (_, index) => ({
    username: `Admin${index}`, role: 'admin', password: 'test-password',
  })));
  const first = await summary(provider);
  const second = await request(app).get(`/api/social/${provider._id}?page=2`);
  expect(first.body.friends).toHaveLength(20);
  expect(first.body.friendCount).toBe(26);
  expect(first.body.pagination.hasNextPage).toBe(true);
  expect(second.body.friends).toHaveLength(6);
  expect(second.body.pagination.hasNextPage).toBe(false);
  expect(new Set([...first.body.friends, ...second.body.friends].map((user) => user._id)).size).toBe(26);
  expect(first.body.viewer.userId).toBeNull();
});
