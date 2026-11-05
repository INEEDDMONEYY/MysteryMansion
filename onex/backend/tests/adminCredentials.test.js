import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import adminRoutes from '../src/modules/admin/routes.js';

let mongoServer;
let admin;
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.user = { id: String(admin?._id) };
  next();
});
app.use('/api/admin', adminRoutes);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({ instance: { launchTimeout: 30000 } });
  await mongoose.connect(mongoServer.getUri());
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  admin = await User.create({
    username: 'boss', password: 'hashed-placeholder', email: 'boss@example.test', accountType: 'provider', role: 'admin',
  });
});

test('PUT /api/admin/settings/credentials is routed and updates the admin username', async () => {
  const res = await request(app)
    .put('/api/admin/settings/credentials')
    .send({ username: 'newboss', password: undefined });
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect((await User.findById(admin._id).lean()).username).toBe('newboss');
});

test('PUT /api/admin/credentials keeps working as the original path', async () => {
  const res = await request(app).put('/api/admin/credentials').send({ username: 'boss2' });
  expect(res.status).toBe(200);
});
