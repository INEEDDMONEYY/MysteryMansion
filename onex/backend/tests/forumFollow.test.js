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
import { ForumFollow, ForumVote, ForumBookmark, ForumCategoryFollow } from '../src/models/ForumInteraction.js';
import { collectForumDigest, processForumDigests, sendForumDigestEmail } from '../src/modules/forum/forumDigest.js';
import env from '../src/config/env.js';
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

test('forum settings are private, validated and shared by client and provider accounts', async () => {
  expect((await request(app).get('/api/forum/me/settings')).status).toBe(401);
  await User.updateOne({ _id: users[1]._id }, { $set: { accountType: 'client' } });
  for (const user of users.slice(0, 2)) {
    const loaded = await request(app).get('/api/forum/me/settings').set('Authorization', auth(user));
    expect(loaded.body.settings).toMatchObject({ mentions: true, digestFrequency: 'weekly' });
    const saved = await request(app).patch('/api/forum/me/settings').set('Authorization', auth(user))
      .send({ mentions: false, digestFrequency: 'daily' });
    expect(saved.body.settings).toMatchObject({ mentions: false, digestFrequency: 'daily' });
  }
  for (const body of [{ mentions: 'false' }, { digestFrequency: 'monthly' }, { role: 'admin' }, {}, { constructor: true }]) {
    expect((await request(app).patch('/api/forum/me/settings').set('Authorization', auth(users[0])).send(body)).status).toBe(400);
  }
  const publicUser = await User.findById(users[0]._id).lean();
  expect(publicUser.forumSettings).toBeUndefined();
  expect(publicUser.forumDigest).toBeUndefined();
});

test('reply and followed-discussion preferences suppress alerts, mentions respect their own preference', async () => {
  await User.updateOne({ _id: users[0]._id }, { $set: { 'forumSettings.discussionReplies': false } });
  await User.updateOne({ _id: users[1]._id }, { $set: { 'forumSettings.followedDiscussionNotifications': false } });
  await settings(users[1], true, true);
  await reply(users[3]);
  expect(await recipients()).toEqual([]);
  const mentioned = await request(app).post(`/api/forum/threads/${thread._id}/replies`)
    .set('Authorization', auth(users[3])).send({ content: '@author please take a look. @reader too!' });
  expect(mentioned.status).toBe(201);
  expect(await Notification.countDocuments({ type: 'forum_mention' })).toBe(2);
  await User.updateMany({}, { $set: { 'forumSettings.mentions': false } });
  await request(app).post(`/api/forum/threads/${thread._id}/replies`)
    .set('Authorization', auth(users[3])).send({ content: '@author please take a look.' });
  expect(await Notification.countDocuments({ type: 'forum_mention' })).toBe(2);
});

test('auto-follow creates follows on participation, preserves explicit unfollow, and can be disabled', async () => {
  await reply(users[3]);
  expect(await ForumFollow.findOne({ userId: users[3]._id, threadId: thread._id }).lean())
    .toMatchObject({ following: true, notificationsEnabled: true });
  await settings(users[3], false, false);
  await reply(users[3]);
  expect(await ForumFollow.findOne({ userId: users[3]._id, threadId: thread._id }).lean())
    .toMatchObject({ following: false, notificationsEnabled: false });
  await User.updateOne({ _id: users[1]._id }, { $set: { 'forumSettings.autoFollowDiscussions': false } });
  await reply(users[1]);
  expect(await ForumFollow.countDocuments({ userId: users[1]._id })).toBe(0);
});

test('mentions match full usernames including spaces and punctuation, not emails or partial names', async () => {
  await User.updateOne({ _id: users[1]._id }, { $set: { username: 'Reader.Name' } });
  await User.updateOne({ _id: users[2]._id }, { $set: { username: 'Two Words' } });
  const response = await request(app).post(`/api/forum/threads/${thread._id}/replies`)
    .set('Authorization', auth(users[3]))
    .send({ content: '@Reader.Name please check. @Two Words thanks. foo@author.test @otherperson' });
  expect(response.status).toBe(201);
  const alerts = await Notification.find({ type: 'forum_mention' }).lean();
  expect(alerts.map((alert) => String(alert.userId)).sort())
    .toEqual([String(users[1]._id), String(users[2]._id)].sort());
});

test('category following persists and new-discussion alerts honor settings and mentions', async () => {
  const categoryId = String(thread.categoryId);
  const follow = (following) => request(app).put(`/api/forum/categories/${categoryId}/follow`)
    .set('Authorization', auth(users[1])).send({ following });
  expect((await follow(true)).status).toBe(200);
  expect((await follow(true)).status).toBe(200);
  expect(await ForumCategoryFollow.countDocuments({ userId: users[1]._id })).toBe(1);
  const list = await request(app).get('/api/forum/me/followed-categories').set('Authorization', auth(users[1]));
  expect(list.body.categoryIds).toEqual([categoryId]);
  const create = (content) => request(app).post('/api/forum/threads').set('Authorization', auth(users[0]))
    .send({ categoryId, title: 'New discussion', content });
  expect((await create('Some content for the discussion.')).status).toBe(201);
  expect(await Notification.countDocuments({ type: 'forum_category' })).toBe(0);
  await User.updateOne({ _id: users[1]._id }, { $set: { 'forumSettings.followedCategoryNotifications': true } });
  expect((await create('Another discussion to follow.')).status).toBe(201);
  expect(await Notification.countDocuments({ type: 'forum_category', userId: users[1]._id })).toBe(1);
  expect((await create('@reader this is a mention in a new discussion.')).status).toBe(201);
  expect(await Notification.countDocuments({ type: 'forum_mention', userId: users[1]._id })).toBe(1);
  const inbox = await request(app).get('/api/forum/me/notifications').set('Authorization', auth(users[1]));
  expect(inbox.body.notifications).toHaveLength(2);
  expect(await ForumFollow.countDocuments({ userId: users[0]._id })).toBe(3);
  expect((await follow(false)).status).toBe(200);
  expect(await ForumCategoryFollow.countDocuments({ userId: users[1]._id })).toBe(0);
});

async function prepareDigest(frequency = 'daily') {
  const now = new Date();
  await User.updateMany({}, { $set: { 'forumSettings.digestFrequency': 'off' } });
  await User.updateOne({ _id: users[1]._id }, { $set: {
    'forumSettings.digestFrequency': frequency,
    'forumDigest.through': new Date(+now - 8 * 86400000),
  } });
  await settings(users[1], true, false); // Digest is independent of the in-app bell.
  await reply(users[3]);
  return new Date(+now + 1000);
}

test.each(['daily', 'weekly'])('%s digest sends new followed activity once and survives subsequent runs', async (frequency) => {
  const now = await prepareDigest(frequency);
  const send = jest.fn(async () => ({ provider: 'cloudflare', queued: [users[1].email] }));
  await Promise.all([processForumDigests({ now, send }), processForumDigests({ now, send })]);
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toMatchObject({
    to: users[1].email, frequency,
    items: [expect.objectContaining({ id: String(thread._id), replyCount: 1 })],
  });
  await processForumDigests({ now: new Date(+now + 1000), send });
  expect(send).toHaveBeenCalledTimes(1);
  expect((await User.findById(users[1]._id).select('+forumDigest').lean()).forumDigest.through).toEqual(now);
});

test('digest includes category discussions, excludes archived/deleted/self activity and does not send empty digests', async () => {
  const now = await prepareDigest();
  await ForumCategoryFollow.create({ userId: users[1]._id, categoryId: thread.categoryId });
  const created = await ForumThread.create({
    authorId: users[0]._id, categoryId: thread.categoryId, title: 'Category activity', content: 'New discussion content',
  });
  const since = new Date(+now - 86400000);
  let items = await collectForumDigest(users[1]._id, since, new Date(+now + 5000));
  expect(items.map((item) => item.id)).toContain(String(created._id));
  await ForumThread.updateMany({}, { $set: { archived: true } });
  items = await collectForumDigest(users[1]._id, since, new Date(+now + 5000));
  expect(items).toEqual([]);
  const send = jest.fn();
  await processForumDigests({ now, send });
  expect(send).not.toHaveBeenCalled();
});

test('digest failures and admin skips retain the watermark and defer retries', async () => {
  const now = await prepareDigest();
  const previous = (await User.findById(users[1]._id).select('+forumDigest').lean()).forumDigest.through;
  const send = jest.fn(async () => ({ skipped: true }));
  await processForumDigests({ now, send });
  const user = await User.findById(users[1]._id).select('+forumDigest').lean();
  expect(user.forumDigest.through).toEqual(previous);
  expect(user.forumDigest.nextAttemptAt).toEqual(new Date(+now + 3600000));
  await processForumDigests({ now, send });
  expect(send).toHaveBeenCalledTimes(1);
});

test('digest opt-outs and provider failures never advance the delivery watermark', async () => {
  const now = await prepareDigest();
  const through = (await User.findById(users[1]._id).select('+forumDigest').lean()).forumDigest.through;
  const error = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    const send = jest.fn(async () => { throw new Error('Email provider failed'); });
    await processForumDigests({ now, send });
    expect(send).toHaveBeenCalledTimes(1);
    const user = await User.findById(users[1]._id).select('+forumDigest').lean();
    expect(user.forumDigest.through).toEqual(through);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('Forum digest failed'), 'Email provider failed');
    await User.updateOne({ _id: users[1]._id }, { $set: { 'forumSettings.digestFrequency': 'off' } });
    await processForumDigests({ now: new Date(+now + 7200000), send });
    expect(send).toHaveBeenCalledTimes(1);
  } finally { error.mockRestore(); }
});

test('digest email uses shared Cloudflare sender and escapes user-controlled titles', async () => {
  const fetch = global.fetch;
  const token = env.CLOUDFLARE_API_TOKEN;
  const account = env.CLOUDFLARE_ACCOUNT_ID;
  const forced = process.env.EMAIL_FORCE_PROVIDER;
  try {
    env.CLOUDFLARE_API_TOKEN = 'test-token';
    env.CLOUDFLARE_ACCOUNT_ID = 'a'.repeat(32);
    delete process.env.EMAIL_FORCE_PROVIDER;
    global.fetch = jest.fn(async () => ({
      ok: true, status: 200, json: async () => ({ success: true, result: {
        delivered: [], queued: [users[1].email], permanent_bounces: [],
      } }),
    }));
    // The shared admin switch is checked without accessing production data.
    const AdminSettings = (await import('../src/models/AdminSettings.js')).default;
    const spy = jest.spyOn(AdminSettings, 'findOne').mockReturnValue({ select: () => ({ lean: async () => null }) });
    try {
      await sendForumDigestEmail({
        to: users[1].email, username: '<reader>', frequency: 'weekly', settingsPath: '/client/settings',
        items: [{ id: String(thread._id), title: '<script>test</script>', replyCount: 2, newDiscussion: false }],
      });
      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body.html).toContain('&lt;script&gt;test&lt;/script&gt;');
      expect(body.html).toContain('/client/settings#forum-settings');
      expect(body.html).not.toContain('<script>test</script>');
    } finally { spy.mockRestore(); }
  } finally {
    global.fetch = fetch;
    env.CLOUDFLARE_API_TOKEN = token;
    env.CLOUDFLARE_ACCOUNT_ID = account;
    if (forced === undefined) delete process.env.EMAIL_FORCE_PROVIDER;
    else process.env.EMAIL_FORCE_PROVIDER = forced;
  }
});

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
  await Promise.all([User, ForumThread, ForumCategory, ForumReply, ForumFollow, ForumCategoryFollow, ForumVote, ForumBookmark, Notification]
    .map((model) => model.deleteMany({})));
  users = await User.create(['author', 'reader', 'muted', 'replier', 'other'].map((username) => ({
    username, password: 'test-password', email: `${username}@example.test`,
  })));
  const category = await ForumCategory.create({ name: 'Test category', slug: 'test-category', status: 'approved' });
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
