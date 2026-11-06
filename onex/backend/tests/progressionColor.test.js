import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Membership from '../src/models/Membership.js';
import progressionRoutes from '../src/modules/progression/routes.js';
import { setProgressionColor, getUserPerks } from '../src/modules/membership/membershipService.js';
import { MEMBERSHIP_TIERS } from '../src/modules/membership/membershipCatalog.js';

const app = express();
app.use('/api/progression', progressionRoutes);

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
  await Promise.all([User, Membership].map((model) => model.deleteMany({})));
});

const makeUser = (username, role = 'user') => User.create({
  username,
  password: 'test-password',
  email: `${username}@example.test`,
  accountType: 'provider',
  role,
  credits: 0,
});

const joinTier = (userId, tier) => Membership.create({
  userId,
  tier,
  status: 'active',
  renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
});

test('members without a membership cannot set a ring color', async () => {
  const user = await makeUser('free');
  expect(await setProgressionColor(user, 'orange')).toMatchObject({ ok: false, status: 403 });
});

test('Standard members get four solid colors only', async () => {
  const user = await makeUser('standard');
  await joinTier(user._id, 'Standard');
  expect(await setProgressionColor(user, 'pink')).toMatchObject({ ok: true, data: { progressionColor: 'pink' } });
  expect(await setProgressionColor(user, 'brown')).toMatchObject({ ok: false, status: 403 });
  expect(await setProgressionColor(user, 'carrot')).toMatchObject({ ok: false, status: 403 });
});

test('Premium members get all solid colors but not gradients', async () => {
  const user = await makeUser('premium');
  await joinTier(user._id, 'Premium');
  expect((await setProgressionColor(user, 'brown')).ok).toBe(true);
  expect(await setProgressionColor(user, 'seascape')).toMatchObject({ ok: false, status: 403 });
});

test('Elite members get gradients too', async () => {
  const user = await makeUser('elite');
  await joinTier(user._id, 'Elite');
  expect((await setProgressionColor(user, 'seascape')).ok).toBe(true);
});

test('admins can use every ring color', async () => {
  const admin = await makeUser('boss', 'admin');
  expect((await setProgressionColor(admin, 'honeydew')).ok).toBe(true);
});

test('admin perks are at least as generous as every tier on every perk', async () => {
  const { perks } = await getUserPerks({ _id: new mongoose.Types.ObjectId(), role: 'admin' });
  for (const tier of Object.values(MEMBERSHIP_TIERS)) {
    for (const [key, value] of Object.entries(tier.perks)) {
      if (typeof value === 'boolean') {
        expect([key, perks[key]]).toEqual([key, perks[key] || !value]);
      } else if (Array.isArray(value)) {
        expect(value.every((id) => perks[key].includes(id))).toBe(true);
      } else {
        expect([key, perks[key] >= value]).toEqual([key, true]);
      }
    }
  }
});

test('unknown colors are rejected and an empty value restores the default ring', async () => {
  const user = await makeUser('elite2');
  await joinTier(user._id, 'Elite');
  expect(await setProgressionColor(user, 'neon')).toMatchObject({ ok: false, status: 400 });
  expect(await setProgressionColor(user, '')).toMatchObject({ ok: true, data: { progressionColor: null } });
});

test('the public profile falls back to the default ring after a downgrade', async () => {
  const user = await makeUser('downgraded');
  await joinTier(user._id, 'Elite');
  await setProgressionColor(user, 'carrot');

  let res = await request(app).get(`/api/progression/${user._id}`);
  expect(res.status).toBe(200);
  expect(res.body.progressionColor).toBe('carrot');

  await Membership.deleteMany({});
  res = await request(app).get(`/api/progression/${user._id}`);
  expect(res.body.progressionColor).toBeNull();
});
