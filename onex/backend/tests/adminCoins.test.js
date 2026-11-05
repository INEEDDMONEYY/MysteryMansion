import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import CreditEarnRule from '../src/models/CreditEarnRule.js';
import { awardCredits } from '../src/modules/credits/creditEarnService.js';

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
  await Promise.all([User, CreditEarnRule].map((model) => model.deleteMany({})));
  await CreditEarnRule.create({
    key: 'test_reward', label: 'Test reward', credits: 10, roles: ['provider', 'client', 'admin'], isActive: true,
  });
});

const makeUser = (username, role) => User.create({
  username,
  password: 'test-password',
  email: `${username}@example.test`,
  accountType: 'provider',
  role,
  credits: 0,
});

test('admin accounts receive no earned coins', async () => {
  const admin = await makeUser('boss', 'admin');
  const result = await awardCredits({ userId: admin._id, eventKey: 'test_reward' });
  expect(result).toMatchObject({ awarded: false, reason: 'admin' });
  expect((await User.findById(admin._id).lean()).credits).toBe(0);
});

test('admin accounts are skipped even for forced grants', async () => {
  const admin = await makeUser('boss2', 'admin');
  const result = await awardCredits({ userId: admin._id, eventKey: 'test_reward', force: true });
  expect(result).toMatchObject({ awarded: false, reason: 'admin' });
  expect((await User.findById(admin._id).lean()).credits).toBe(0);
});

test('non-admin providers still earn coins', async () => {
  const provider = await makeUser('pro', 'user');
  const result = await awardCredits({ userId: provider._id, eventKey: 'test_reward' });
  expect(result.awarded).toBe(true);
  expect((await User.findById(provider._id).lean()).credits).toBe(10);
});
