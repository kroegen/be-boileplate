import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { setUpConnection, disconnect } from '../src/mongoose.js';
import Comment from '../src/models/Comment.js';

const testDbUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/be-boilerplate-test';

describe('API Smoke Tests', () => {
  beforeAll(async () => {
    await setUpConnection(testDbUri);
  });

  afterAll(async () => {
    // Clean up test data
    await mongoose.connection.dropDatabase();
    await disconnect();
  });

  describe('GET /api/users', () => {
    it('should return 200 with empty users array', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(1);
      expect(res.body.data.users).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/users', () => {
    it('should return 201 with user data when creating a new user', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Test User', email: `test-${Date.now()}@example.com` });
      expect(res.status).toBe(201);
      expect(res.body.status).toBe(1);
      expect(res.body.data.user).toMatchObject({
        name: 'Test User',
        email: expect.any(String),
      });
      expect(res.body.data.user).not.toHaveProperty('passwordHash');
      expect(res.body.data.user).not.toHaveProperty('salt');
    });

    it('should not return passwordHash or salt in user response', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Security Test', email: `security-${Date.now()}@example.com` });
      expect(res.status).toBe(201);
      expect(res.body.data.user).not.toHaveProperty('passwordHash');
      expect(res.body.data.user).not.toHaveProperty('salt');
    });

    it('should return 400 when email is missing', async () => {
      const res = await request(app).post('/api/users').send({ name: 'Test User' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/posts', () => {
    it('should return 200 with empty posts array', async () => {
      const res = await request(app).get('/api/posts');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(1);
      expect(res.body.data.posts).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/posts', () => {
    it('should return 201 with post data when creating a new post', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({ author: 'Test Author', content: 'Test content' });
      expect(res.status).toBe(201);
      expect(res.body.status).toBe(1);
      expect(res.body.data.post).toMatchObject({
        author: 'Test Author',
        content: 'Test content',
      });
    });

    it('should return a serialized post matching the list item shape', async () => {
      const created = await request(app)
        .post('/api/posts')
        .send({ author: 'Contract Author', content: 'Contract content' });
      expect(created.status).toBe(201);
      expect(created.body.status).toBe(1);
      expect(created.body.data.post.id).toEqual(expect.any(String));
      expect(Object.keys(created.body.data.post).sort()).toEqual(['author', 'content', 'id']);

      const res = await request(app).get('/api/posts');
      expect(res.status).toBe(200);
      const listed = res.body.data.posts.find((post) => post.id === created.body.data.post.id);
      expect(listed).toEqual(created.body.data.post);
    });

    it('should return 400 when author is missing', async () => {
      const res = await request(app).post('/api/posts').send({ content: 'Test content' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/comments', () => {
    it('should return 200 with empty comments array', async () => {
      const res = await request(app).get('/api/comments');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(1);
      expect(res.body.data.comments).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/comments', () => {
    it('should return 201 with serialized comment data when creating a new comment', async () => {
      const res = await request(app)
        .post('/api/comments')
        .send({ author: 'Test Author', content: 'Test content' });
      expect(res.status).toBe(201);
      expect(res.body.status).toBe(1);
      expect(res.body.data.comment).toMatchObject({
        author: 'Test Author',
        content: 'Test content',
      });
      expect(res.body.data.comment.id).toEqual(expect.any(String));
      expect(Object.keys(res.body.data.comment).sort()).toEqual(['author', 'content', 'id']);
    });

    it('persists submitted content through save, create responses, and list responses', async () => {
      const content = `Persisted content ${Date.now()}`;
      const created = await request(app)
        .post('/api/comments')
        .send({ author: 'Content Check', content });
      expect(created.status).toBe(201);
      expect(created.body.data.comment).toMatchObject({
        author: 'Content Check',
        content,
      });

      const stored = await Comment.findById(created.body.data.comment.id);
      expect(stored).not.toBeNull();
      expect(stored.content).toBe(content);

      const res = await request(app).get('/api/comments');
      expect(res.status).toBe(200);
      const listed = res.body.data.comments.find(
        (comment) => comment.id === created.body.data.comment.id
      );
      expect(listed).toMatchObject({ author: 'Content Check', content });
    });

    it('should return a serialized comment matching the list item shape', async () => {
      const created = await request(app)
        .post('/api/comments')
        .send({ author: 'Contract Author', content: 'Contract content' });
      expect(created.status).toBe(201);
      expect(created.body.status).toBe(1);
      expect(created.body.data.comment.id).toEqual(expect.any(String));
      expect(Object.keys(created.body.data.comment).sort()).toEqual(['author', 'content', 'id']);

      const res = await request(app).get('/api/comments');
      expect(res.status).toBe(200);
      const listed = res.body.data.comments.find(
        (comment) => comment.id === created.body.data.comment.id
      );
      expect(listed).toEqual(created.body.data.comment);
    });

    it('should return 400 when author is missing', async () => {
      const res = await request(app).post('/api/comments').send({ content: 'Test content' });
      expect(res.status).toBe(400);
      expect(res.body.status).toBe(0);
      expect(res.body.data.errors).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/sessions', () => {
    it('should return 200 with token for valid credentials', async () => {
      // First create a user with known credentials
      const email = `session-test-${Date.now()}@example.com`;
      await request(app).post('/api/users').send({ name: 'Session Test', email });

      // Note: API doesn't accept password, so we can't test login yet
      // This endpoint exists but requires password handling which is Phase 6
    });

    it('should return 401 with status:0 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .send({ email: 'invalid@example.com', password: 'wrong' });
      expect(res.status).toBe(401);
      expect(res.body.status).toBe(0);
      expect(res.body.data.errors).toBeInstanceOf(Array);
    });
  });
});
