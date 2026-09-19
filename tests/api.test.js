import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '#src/app.js';
import { setUpConnection, disconnect } from '#src/mongoose.js';
import Comment from '#src/models/Comment.js';
import User from '#src/models/User.js';

const testDbUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/be-boilerplate-test';
const originalJwtSecret = process.env.JWT_SECRET;
let authToken;

const authorizedGet = (path) => request(app).get(path).set('Authorization', `Bearer ${authToken}`);
const authorizedPost = (path) =>
  request(app).post(path).set('Authorization', `Bearer ${authToken}`);

describe('API Smoke Tests', { timeout: 30000 }, () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'api-test-secret';
    authToken = jwt.sign({ id: 'api-test-user', role: 'ADMIN' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    await setUpConnection(testDbUri);
    await User.ensureIndexes();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await disconnect();
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
  });

  describe('GET /api/users', () => {
    it('should reject a request without a token', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
    });

    it('should return 200 with empty users array', async () => {
      const res = await authorizedGet('/api/users');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(1);
      expect(res.body.data.users).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/users', () => {
    it('should return 201 with user data when creating a new user', async () => {
      const res = await authorizedPost('/api/users').send({
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
      });
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
      const res = await authorizedPost('/api/users').send({
        name: 'Security Test',
        email: `security-${Date.now()}@example.com`,
      });
      expect(res.status).toBe(201);
      expect(res.body.data.user).not.toHaveProperty('passwordHash');
      expect(res.body.data.user).not.toHaveProperty('salt');
    });

    it('should return 400 when email is missing', async () => {
      const res = await authorizedPost('/api/users').send({ name: 'Test User' });
      expect(res.status).toBe(400);
      expect(res.body.data.message).toBe('Validation failed');
      expect(res.body.data.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ param: 'email' })])
      );
    });

    it('should reject an invalid email', async () => {
      const res = await authorizedPost('/api/users').send({ name: 'Test User', email: 'invalid' });
      expect(res.status).toBe(400);
      expect(res.body.data.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ param: 'email' })])
      );
    });

    it('should return 409 for a duplicate email', async () => {
      const email = `duplicate-${Date.now()}@example.com`;
      const first = await authorizedPost('/api/users').send({ name: 'First', email });
      const second = await authorizedPost('/api/users').send({ name: 'Second', email });

      expect(first.status).toBe(201);
      expect(second.status).toBe(409);
      expect(second.body.data.message).toBe('User creation failed');
      expect(second.body.data.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ param: 'email' })])
      );
    });

    it('should reject an explicitly empty password', async () => {
      const res = await authorizedPost('/api/users').send({
        name: 'Empty Password',
        email: `empty-${Date.now()}@example.com`,
        password: '',
      });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe(0);
    });
  });

  describe('GET /api/posts', () => {
    it('should return 200 with empty posts array', async () => {
      const res = await authorizedGet('/api/posts');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(1);
      expect(res.body.data.posts).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/posts', () => {
    it('should return 201 with post data when creating a new post', async () => {
      const res = await authorizedPost('/api/posts').send({
        author: 'Test Author',
        content: 'Test content',
      });
      expect(res.status).toBe(201);
      expect(res.body.status).toBe(1);
      expect(res.body.data.post).toMatchObject({
        author: 'Test Author',
        content: 'Test content',
      });
    });

    it('should return a serialized post matching the list item shape', async () => {
      const created = await authorizedPost('/api/posts').send({
        author: 'Contract Author',
        content: 'Contract content',
      });
      expect(created.status).toBe(201);
      expect(created.body.status).toBe(1);
      expect(created.body.data.post.id).toEqual(expect.any(String));
      expect(Object.keys(created.body.data.post).sort()).toEqual(['author', 'content', 'id']);

      const res = await authorizedGet('/api/posts');
      expect(res.status).toBe(200);
      const listed = res.body.data.posts.find((post) => post.id === created.body.data.post.id);
      expect(listed).toEqual(created.body.data.post);
    });

    it('should return 400 when author is missing', async () => {
      const res = await authorizedPost('/api/posts').send({ content: 'Test content' });
      expect(res.status).toBe(400);
    });

    it('should return 400 when content is missing', async () => {
      const res = await authorizedPost('/api/posts').send({ author: 'Test Author' });
      expect(res.status).toBe(400);
      expect(res.body.data.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ param: 'content' })])
      );
    });

    it('should not expose passwordHash or salt in error responses', async () => {
      const res = await authorizedPost('/api/posts').send({ author: 'Test Author' });
      expect(res.status).toBe(400);
      const responseString = JSON.stringify(res.body);
      expect(responseString).not.toMatch(/passwordHash/i);
      expect(responseString).not.toMatch(/salt/i);
    });
  });

  describe('GET /api/comments', () => {
    it('should return 200 with empty comments array', async () => {
      const res = await authorizedGet('/api/comments');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(1);
      expect(res.body.data.comments).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/comments', () => {
    it('should return 201 with serialized comment data when creating a new comment', async () => {
      const res = await authorizedPost('/api/comments').send({
        author: 'Test Author',
        content: 'Test content',
      });
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
      const created = await authorizedPost('/api/comments').send({
        author: 'Content Check',
        content,
      });
      expect(created.status).toBe(201);
      expect(created.body.data.comment).toMatchObject({
        author: 'Content Check',
        content,
      });

      const stored = await Comment.findById(created.body.data.comment.id);
      expect(stored).not.toBeNull();
      expect(stored.content).toBe(content);

      const res = await authorizedGet('/api/comments');
      expect(res.status).toBe(200);
      const listed = res.body.data.comments.find(
        (comment) => comment.id === created.body.data.comment.id
      );
      expect(listed).toMatchObject({ author: 'Content Check', content });
    });

    it('should return a serialized comment matching the list item shape', async () => {
      const created = await authorizedPost('/api/comments').send({
        author: 'Contract Author',
        content: 'Contract content',
      });
      expect(created.status).toBe(201);
      expect(created.body.status).toBe(1);
      expect(created.body.data.comment.id).toEqual(expect.any(String));
      expect(Object.keys(created.body.data.comment).sort()).toEqual(['author', 'content', 'id']);

      const res = await authorizedGet('/api/comments');
      expect(res.status).toBe(200);
      const listed = res.body.data.comments.find(
        (comment) => comment.id === created.body.data.comment.id
      );
      expect(listed).toEqual(created.body.data.comment);
    });

    it('should return 400 when author is missing', async () => {
      const res = await authorizedPost('/api/comments').send({ content: 'Test content' });
      expect(res.status).toBe(400);
      expect(res.body.status).toBe(0);
      expect(res.body.data.errors).toBeInstanceOf(Array);
    });

    it('should return 400 when content is missing', async () => {
      const res = await authorizedPost('/api/comments').send({ author: 'Test Author' });
      expect(res.status).toBe(400);
      expect(res.body.data.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ param: 'content' })])
      );
    });

    it('should not expose passwordHash or salt in error responses', async () => {
      const res = await authorizedPost('/api/comments').send({ author: 'Test Author' });
      expect(res.status).toBe(400);
      const responseString = JSON.stringify(res.body);
      expect(responseString).not.toMatch(/passwordHash/i);
      expect(responseString).not.toMatch(/salt/i);
    });
  });

  describe('POST /api/sessions', () => {
    it('should return 200 with token for valid credentials', async () => {
      const email = `session-test-${Date.now()}@example.com`;
      const created = await authorizedPost('/api/users').send({
        name: 'Session Test',
        email,
        password: 'correct-password',
      });

      expect(created.status).toBe(201);
      expect(created.body.data.user).not.toHaveProperty('passwordHash');
      expect(created.body.data.user).not.toHaveProperty('salt');

      const res = await request(app)
        .post('/api/sessions')
        .send({ email, password: 'correct-password' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(1);
      expect(res.body.data.token).toEqual(expect.any(String));

      const protectedRes = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${res.body.data.token}`);
      expect(protectedRes.status).toBe(200);

      const invalid = await request(app)
        .post('/api/sessions')
        .send({ email, password: 'wrong-password' });

      expect(invalid.status).toBe(401);
      expect(invalid.body.status).toBe(0);
    });

    it('should return 401 with status:0 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .send({ email: 'invalid@example.com', password: 'wrong' });
      expect(res.status).toBe(401);
      expect(res.body.status).toBe(0);
      expect(res.body.data.message).toBe('Invalid credentials');
      expect(res.body.data.errors).toBeInstanceOf(Array);
    });

    it('should reject an invalid email format', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .send({ email: 'invalid', password: 'password' });
      expect(res.status).toBe(400);
      expect(res.body.data.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ param: 'email' })])
      );
    });

    it('should not expose passwordHash in error responses', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .send({ email: 'invalid@example.com', password: 'wrong' });
      expect(res.status).toBe(401);
      const responseString = JSON.stringify(res.body);
      expect(responseString).not.toMatch(/passwordHash/i);
      expect(responseString).not.toMatch(/salt/i);
    });

    it('should reject users without a password', async () => {
      const email = `no-password-${Date.now()}@example.com`;
      await authorizedPost('/api/users').send({ name: 'No Password', email });

      const res = await request(app)
        .post('/api/sessions')
        .send({ email, password: 'any-password' });

      expect(res.status).toBe(401);
    });

    it('should reject blocked users', async () => {
      const email = `blocked-${Date.now()}@example.com`;
      await new User({
        name: 'Blocked',
        email,
        password: 'correct-password',
        status: 'BLOCKED',
      }).save();

      const res = await request(app)
        .post('/api/sessions')
        .send({ email, password: 'correct-password' });

      expect(res.status).toBe(401);
    });
  });

  describe('Security Headers', () => {
    it('should include Content-Security-Policy header', async () => {
      const res = await request(app).get('/api/users');
      expect(res.headers['content-security-policy']).toBeDefined();
    });

    it('should include X-Content-Type-Options header', async () => {
      const res = await request(app).get('/api/users');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should include X-Frame-Options header', async () => {
      const res = await request(app).get('/api/users');
      expect(res.headers['x-frame-options']).toBeDefined();
    });

    it('should include X-XSS-Protection header', async () => {
      const res = await request(app).get('/api/users');
      expect(res.headers['x-xss-protection']).toBeDefined();
    });
  });

  describe('CORS', () => {
    it('should allow requests from configured origin', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Origin', process.env.CORS_ORIGIN || 'http://localhost:3000')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe(
        process.env.CORS_ORIGIN || 'http://localhost:3000'
      );
    });

    it('should reject requests from disallowed origin', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Origin', 'http://malicious-site.com');
      expect(res.status).toBe(401);
    });
  });
});
