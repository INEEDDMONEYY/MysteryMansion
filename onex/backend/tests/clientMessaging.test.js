import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Conversation from '../src/models/Conversation.js';
import conversationRoutes from '../src/modules/messages/conversationRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/conversations', conversationRoutes);

const secret = 'client-messaging-test-signing-key';
const previousSecret = process.env.JWT_SECRET;
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
  await Promise.all([User, Conversation].map((m) => m.deleteMany({})));
});

const tokenFor = (user) => `Bearer ${jwt.sign({ id: String(user._id) }, secret)}`;

test('clients can start a conversation with any user, while providers stay limited to admins', async () => {
  const base = { password: 'test-password', role: 'user' };
  const client = await User.create({ ...base, username: 'client_one', email: 'c1@example.test', accountType: 'client' });
  const provider = await User.create({ ...base, username: 'provider_one', email: 'p1@example.test', accountType: 'provider' });
  const otherClient = await User.create({ ...base, username: 'client_two', email: 'c2@example.test', accountType: 'client' });
  const otherProvider = await User.create({ ...base, username: 'provider_two', email: 'p2@example.test', accountType: 'provider' });

  for (const recipient of [provider, otherClient, otherProvider]) {
    const res = await request(app).post('/api/conversations').set('Authorization', tokenFor(client))
      .send({ recipientId: String(recipient._id) });
    expect(res.status).toBe(201);
  }

  const providerToProvider = await request(app).post('/api/conversations').set('Authorization', tokenFor(provider))
    .send({ recipientId: String(otherProvider._id) });
  expect(providerToProvider.status).toBe(403);

  const providerToClient = await request(app).post('/api/conversations').set('Authorization', tokenFor(provider))
    .send({ recipientId: String(otherClient._id) });
  expect(providerToClient.status).toBe(201);
});
