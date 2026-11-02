import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import ForumThread from '../src/models/ForumThread.js';
import ForumCategory from '../src/models/ForumCategory.js';
import ForumReply from '../src/models/ForumReply.js';
import { ForumFollow, ForumVote, ForumBookmark } from '../src/models/ForumInteraction.js';
import Notification from '../src/models/Notification.js';
import forumRoutes from '../src/modules/forum/routes.js';

const app = express();
app.use(express.json());
app.use('/api/forum', forumRoutes);

let users;
let thread;
let log;
let warn;
let mongoServer;
const previousSecret = process.env.JWT_SECRET;
const secret = 'forum-follow-test-signing-key';
const auth = (user) => `Bearer ${jwt.sign({ id: String(user._id) }, secret)}`;
const settings = (user, following, notificationsEnabled, id = thread._id) =>
  request(app).put(`/api/forum/threads/${id}/follow`).set('Authorization', auth(user))
    .send({ following, notificationsEnabled });
const reply = (user, parentReplyId) =>
  request(app).post(`/api/forum/threads/${thread._id}/replies`).set('Authorization', auth(user))
    .send({ content: 'A new reply for the test thread.', parentReplyId });
const recipients = async () => (await Notification.find({ type: 'forum_reply' }).lean())
  .map((notification) => String(notification.userId)).sort();

beforeAll(async () => {
  process.env.JWT_SECRET = secret;
  log = jest.spyOn(console, 'log').mockImplementation(() => {});
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  mongoServer = await MongoMemoryServer.create({ instance: { launchTimeout: 30000 } });
  await mongoose.connect(mongoServer.getUri());
  await ForumFollow.init();
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
  if (previousSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousSecret;
  log.mockRestore();
  warn.mockRestore();
});

beforeEach(async () => {
  await Promise.all([User, ForumThread, ForumCategory, ForumReply, ForumFollow, ForumVote, ForumBookmark, Notification]
    .map((model) => model.deleteMany({})));
  users = await User.create(['author', 'reader', 'muted', 'replier', 'other'].map((username) => ({
    username, password: 'test-password', email: `${username}@example.test`,
  })));
  const category = await ForumCategory.create({ name: 'Test category', slug: 'test-category' });
  thread = await ForumThread.create({
    authorId: users[0]._id, categoryId: category._id,
    title: 'Follow this thread', content: 'A discussion used to verify thread follows.',
  });
});

test('requires authentication, validates settings, and rejects unavailable threads and suspended users', async () => {
  expect((await request(app).put(`/api/forum/threads/${thread._id}/follow`).send({})).status).toBe(401);
  expect((await request(app).get('/api/forum/threads?followed=true')).status).toBe(401);
  expect((await request(app).put(`/api/forum/threads/${thread._id}/follow`).set('Authorization', auth(users[1]))).status).toBe(400);
  expect((await settings(users[1], 'true', false)).status).toBe(400);
  expect((await settings(users[1], false, true)).status).toBe(400);
  expect((await settings(users[1], true, true, 'invalid')).status).toBe(400);
  expect((await settings(users[1], true, true, new mongoose.Types.ObjectId())).status).toBe(404);
  await User.updateOne({ _id: users[1]._id }, { status: 'suspended' });
  expect((await settings(users[1], true, true)).status).toBe(403);
  await ForumThread.updateOne({ _id: thread._id }, { archived: true });
  expect((await settings(users[2], true, true)).status).toBe(404);
});

test('persists independent preferences and exposes them on cards, details, and the followed list', async () => {
  expect((await settings(users[1], true, false)).body).toEqual({ following: true, notificationsEnabled: false });
  expect((await settings(users[2], true, true)).status).toBe(200);
  await settings(users[1], true, false);
  expect(await ForumFollow.countDocuments({ userId: users[1]._id })).toBe(1);
  const list = await request(app).get('/api/forum/threads?followed=true&limit=1').set('Authorization', auth(users[1]));
  expect(list.body.pagination).toMatchObject({ total: 1, hasNextPage: false, limit: 1 });
  expect(list.body.threads[0].viewer).toMatchObject({ following: true, notificationsEnabled: false });
  const detail = await request(app).get(`/api/forum/threads/${thread._id}`).set('Authorization', auth(users[2]));
  expect(detail.body.viewer).toMatchObject({ following: true, notificationsEnabled: true });
  const guest = await request(app).get(`/api/forum/threads/${thread._id}`);
  expect(guest.body.viewer).toMatchObject({ following: false, notificationsEnabled: false });
  const other = await request(app).get('/api/forum/threads?followed=true').set('Authorization', auth(users[4]));
  expect(other.body.threads).toEqual([]);
  await settings(users[1], false, false);
  const empty = await request(app).get('/api/forum/threads?followed=true').set('Authorization', auth(users[1]));
  expect(empty.body.threads).toEqual([]);
  expect((await ForumFollow.findOne({ userId: users[2]._id }).lean()).notificationsEnabled).toBe(true);
});

test('only notifies enabled followers and existing authors, excludes self, and honors mute and unfollow', async () => {
  await settings(users[1], true, true);
  await settings(users[2], true, false);
  await settings(users[3], true, true);
  expect((await reply(users[3])).status).toBe(201);
  expect(await recipients()).toEqual([String(users[0]._id), String(users[1]._id)].sort());
  await Notification.deleteMany({});
  await settings(users[1], false, false);
  await settings(users[0], true, false);
  expect((await reply(users[3])).status).toBe(201);
  expect(await recipients()).toEqual([]);
  await settings(users[0], true, true);
  expect((await reply(users[3])).status).toBe(201);
  expect(await recipients()).toEqual([String(users[0]._id)]);
});

test('deduplicates parent-author/follower notifications and keeps reply links', async () => {
  await settings(users[0], true, true);
  const parent = await ForumReply.create({ threadId: thread._id, authorId: users[0]._id, content: 'Author comment' });
  expect((await reply(users[3], String(parent._id))).status).toBe(201);
  expect(await recipients()).toEqual([String(users[0]._id)]);
  const notification = await Notification.findOne({ type: 'forum_reply' }).lean();
  expect(notification.meta.threadId).toBe(String(thread._id));
  expect(notification.meta.replyId).toBeTruthy();
});

test('archived threads disappear from followed results and deletion removes follow preferences', async () => {
  await settings(users[1], true, true);
  await ForumThread.updateOne({ _id: thread._id }, { archived: true });
  const list = await request(app).get('/api/forum/threads?followed=true').set('Authorization', auth(users[1]));
  expect(list.body.pagination.total).toBe(0);
  const deleted = await request(app).delete(`/api/forum/threads/${thread._id}`).set('Authorization', auth(users[0]));
  expect(deleted.status).toBe(200);
  expect(await ForumFollow.countDocuments({ threadId: thread._id })).toBe(0);
});

test('paginates followed threads and remains idempotent on repeated simultaneous saves', async () => {
  const second = await ForumThread.create({
    authorId: users[0]._id, categoryId: thread.categoryId,
    title: 'Another thread', content: 'Another discussion with an independent preference.',
  });
  const saves = await Promise.all(Array.from({ length: 4 }, () => settings(users[1], true, true)));
  expect(saves.map((result) => result.status)).toEqual([200, 200, 200, 200]);
  expect(await ForumFollow.countDocuments({ userId: users[1]._id, threadId: thread._id })).toBe(1);
  await settings(users[1], true, false, second._id);
  const firstPage = await request(app).get('/api/forum/threads?followed=true&limit=1').set('Authorization', auth(users[1]));
  const secondPage = await request(app).get('/api/forum/threads?followed=true&limit=1&page=2').set('Authorization', auth(users[1]));
  expect(firstPage.body.pagination).toMatchObject({ total: 2, hasNextPage: true });
  expect(secondPage.body.pagination).toMatchObject({ total: 2, hasNextPage: false });
  expect(firstPage.body.threads[0].id).not.toBe(secondPage.body.threads[0].id);
});

test('follower summaries count real follows, cap previews at ten, and exclude private data', async () => {
  const followers = await User.create(Array.from({ length: 11 }, (_, i) => ({
    username: `follower-${i}`, password: 'test-password', email: `private-${i}@example.test`,
    profilePic: `/photo-${i}.png`,
  })));
  await ForumFollow.create(followers.map((user) => ({ userId: user._id, threadId: thread._id, following: true })));
  await ForumFollow.create([
    { userId: users[1]._id, threadId: thread._id, following: false },
    { userId: new mongoose.Types.ObjectId(), threadId: thread._id, following: true },
  ]);
  const endpoint = `/api/forum/threads/${thread._id}/followers`;
  const response = await request(app).get(endpoint);
  expect(response.status).toBe(200);
  expect(response.body.followerCount).toBe(11);
  expect(response.body.followers).toHaveLength(10);
  expect(Object.keys(response.body.followers[0]).sort()).toEqual(['id', 'profilePic', 'username']);
  expect((await ForumThread.findById(thread._id).lean()).viewCount).toBe(0);
  const list = await request(app).get('/api/forum/threads');
  expect(list.body.threads[0].followerCount).toBe(11);
  const detail = await request(app).get(`/api/forum/threads/${thread._id}`);
  expect(detail.body.followers).toHaveLength(10);
  await ForumFollow.updateOne({ userId: followers[0]._id, threadId: thread._id }, { following: false });
  expect((await request(app).get(endpoint)).body.followerCount).toBe(10);
  await ForumFollow.updateMany({ threadId: thread._id }, { following: false });
  expect((await request(app).get(endpoint)).body).toEqual({ followerCount: 0, followers: [] });
  await ForumThread.updateOne({ _id: thread._id }, { archived: true });
  expect((await request(app).get(endpoint)).status).toBe(404);
});

test('forum inbox requires sign-in and only lists the account-owned forum notifications', async () => {
  expect((await request(app).get('/api/forum/me/notifications')).status).toBe(401);
  expect((await request(app).patch('/api/forum/me/notifications/read-all')).status).toBe(401);
  const docs = await Notification.create([
    { audience: 'user', userId: users[1]._id, type: 'forum_reply', title: 'First alert', message: 'A reply', read: false },
    { audience: 'user', userId: users[1]._id, type: 'forum_reply', title: 'Second alert', message: 'Another reply', read: true },
    { audience: 'user', userId: users[1]._id, type: 'welcome', title: 'Welcome', message: 'Account alert' },
    { audience: 'user', userId: users[2]._id, type: 'forum_reply', title: 'Private', message: 'Another account' },
    { audience: 'admin', userId: users[1]._id, type: 'forum_reply', title: 'Admin only', message: 'Admin alert' },
  ]);
  const first = await request(app).get('/api/forum/me/notifications?limit=1').set('Authorization', auth(users[1]));
  expect(first.status).toBe(200);
  expect(first.body.notifications).toHaveLength(1);
  expect(first.body).toMatchObject({ unreadCount: 1, pagination: { total: 2, page: 1, hasNextPage: true } });
  const second = await request(app).get('/api/forum/me/notifications?limit=1&page=2').set('Authorization', auth(users[1]));
  expect(second.body.notifications).toHaveLength(1);
  expect(second.body.notifications[0]._id).not.toBe(first.body.notifications[0]._id);
  expect(second.body.pagination.hasNextPage).toBe(false);
  const unread = await request(app).get('/api/forum/me/notifications?unread=true').set('Authorization', auth(users[1]));
  expect(unread.body.notifications.map((item) => item._id)).toEqual([String(docs[0]._id)]);
  expect(unread.body.pagination.total).toBe(1);
});

test('read operations reject foreign or non-forum alerts and only persist owned forum read state', async () => {
  const docs = await Notification.create([
    { audience: 'user', userId: users[1]._id, type: 'forum_reply', title: 'Forum', message: 'Reply' },
    { audience: 'user', userId: users[1]._id, type: 'forum_reply', title: 'Another', message: 'Reply' },
    { audience: 'user', userId: users[1]._id, type: 'welcome', title: 'Welcome', message: 'Account' },
    { audience: 'user', userId: users[2]._id, type: 'forum_reply', title: 'Private', message: 'Foreign' },
    { audience: 'admin', userId: users[1]._id, type: 'forum_reply', title: 'Admin', message: 'Admin' },
  ]);
  const mark = (id) => request(app).patch(`/api/forum/me/notifications/${id}/read`).set('Authorization', auth(users[1]));
  expect((await mark('bad-id')).status).toBe(400);
  expect((await mark(docs[2]._id)).status).toBe(404);
  expect((await mark(docs[3]._id)).status).toBe(404);
  expect((await mark(docs[4]._id)).status).toBe(404);
  expect((await mark(docs[0]._id)).body.notification.read).toBe(true);
  expect((await mark(docs[0]._id)).status).toBe(200);
  let list = await request(app).get('/api/forum/me/notifications').set('Authorization', auth(users[1]));
  expect(list.body.unreadCount).toBe(1);
  expect((await request(app).patch('/api/forum/me/notifications/read-all').set('Authorization', auth(users[1]))).status).toBe(200);
  list = await request(app).get('/api/forum/me/notifications?unread=true').set('Authorization', auth(users[1]));
  expect(list.body).toMatchObject({ notifications: [], unreadCount: 0 });
  for (const doc of docs.slice(2)) expect((await Notification.findById(doc._id).lean()).read).toBe(false);
});

test('engagement reports real account activity with no self-interaction inflation and a 14-day series', async () => {
  expect((await request(app).get('/api/forum/me/analytics')).status).toBe(401);
  await ForumThread.updateOne({ _id: thread._id }, { viewCount: 17 });
  const authorReply = await ForumReply.create({ threadId: thread._id, authorId: users[0]._id, content: 'My own reply' });
  await ForumReply.create({ threadId: thread._id, authorId: users[1]._id, content: 'A member reply', parentReplyId: authorReply._id });
  await ForumReply.create({ threadId: thread._id, authorId: users[2]._id, content: 'Deleted reply', isDeleted: true });
  await ForumVote.create([
    { userId: users[1]._id, targetType: 'thread', targetId: thread._id, value: 1 },
    { userId: users[2]._id, targetType: 'reply', targetId: authorReply._id, value: 1 },
    { userId: users[0]._id, targetType: 'thread', targetId: thread._id, value: 1 },
    { userId: users[3]._id, targetType: 'thread', targetId: thread._id, value: -1 },
  ]);
  await ForumBookmark.create({ userId: users[1]._id, targetType: 'thread', targetId: thread._id });
  const response = await request(app).get('/api/forum/me/analytics').set('Authorization', auth(users[0]));
  expect(response.status).toBe(200);
  expect(response.body.totals).toEqual({
    threads: 1, replies: 1, repliesReceived: 1, votesReceived: 2, savesReceived: 1, solutions: 0, views: 17,
  });
  expect(response.body.daily).toHaveLength(14);
  expect(response.body.daily.at(-1)).toMatchObject({ replies: 1, votes: 2 });
  expect(response.body.topThreads[0]).toMatchObject({ id: String(thread._id), replies: 1, votes: 1, saves: 1, views: 17 });
  const empty = await request(app).get('/api/forum/me/analytics').set('Authorization', auth(users[4]));
  expect(Object.values(empty.body.totals).every((count) => count === 0)).toBe(true);
  expect(empty.body.topThreads).toEqual([]);
});
