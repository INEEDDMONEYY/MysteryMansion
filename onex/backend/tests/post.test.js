// test/post.test.js
import './setup.js';
import seedPosts from './seed.js';
import request from 'supertest';
import app from '../server.js';
import Post from '../src/models/Post.js';

beforeEach(async () => {
  await seedPosts(10); // populate test DB before each test
});

describe('GET /api/posts', () => {
  it('should return 10 seeded posts', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(10);
    expect(res.body[0]).toHaveProperty('title');
    expect(res.body[0]).toHaveProperty('description');
  });
});

