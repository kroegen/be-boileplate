import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import jwt from 'jsonwebtoken';
import { authenticate } from '#src/utils/auth.js';

const originalJwtSecret = process.env.JWT_SECRET;

beforeAll(() => {
  process.env.JWT_SECRET = 'test-jwt-secret-for-auth-middleware';
});

afterAll(() => {
  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalJwtSecret;
  }
});

const createMockRequest = (overrides = {}) => ({
  headers: {},
  user: null,
  ...overrides,
});

const createMockResponse = () => {
  let statusCode = 200;
  let returnedBody = null;
  let headersSent = false;

  const response = {
    status: (code) => {
      statusCode = code;
      return response;
    },
    json: (body) => {
      returnedBody = body;
      headersSent = true;
      return response;
    },
    getStatusCode: () => statusCode,
    getBody: () => returnedBody,
    hasHeadersSent: () => headersSent,
  };

  return response;
};

const next = () => {};

describe('JWT Authentication Middleware', () => {
  describe('Missing token', () => {
    it('should return 401 with "Missing authentication token" when Authorization header is missing', async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      await authenticate(req, res, next);

      expect(res.getStatusCode()).toBe(401);
      expect(res.getBody().status).toBe(0);
      expect(res.getBody().data.errors).toBeInstanceOf(Array);
      expect(res.getBody().data.errors[0]).toMatchObject({
        type: 'UNAUTHORIZED',
        message: 'Missing authentication token',
      });
    });

    it('should return 401 when Authorization header is empty string', async () => {
      const req = createMockRequest({ headers: { authorization: '' } });
      const res = createMockResponse();

      await authenticate(req, res, next);

      expect(res.getStatusCode()).toBe(401);
      expect(res.getBody().data.errors[0]).toMatchObject({
        type: 'UNAUTHORIZED',
        message: 'Missing authentication token',
      });
    });

    it('should return 401 when Authorization header does not start with "Bearer "', async () => {
      const req = createMockRequest({ headers: { authorization: 'Token abc123' } });
      const res = createMockResponse();

      await authenticate(req, res, next);

      expect(res.getStatusCode()).toBe(401);
      expect(res.getBody().data.errors[0]).toMatchObject({
        type: 'UNAUTHORIZED',
        message: 'Missing authentication token',
      });
    });
  });

  describe('Invalid token', () => {
    it('should return 401 with "Invalid authentication token" for malformed token', async () => {
      const req = createMockRequest({ headers: { authorization: 'Bearer invalid-token' } });
      const res = createMockResponse();

      await authenticate(req, res, next);

      expect(res.getStatusCode()).toBe(401);
      expect(res.getBody().data.errors[0]).toMatchObject({
        type: 'UNAUTHORIZED',
        message: 'Invalid authentication token',
      });
    });

    it('should return 401 with "Invalid authentication token" for tampered token', async () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const req = createMockRequest({ headers: { authorization: `Bearer ${token}` } });
      const res = createMockResponse();

      await authenticate(req, res, next);

      expect(res.getStatusCode()).toBe(401);
      expect(res.getBody().data.errors[0]).toMatchObject({
        type: 'UNAUTHORIZED',
        message: 'Invalid authentication token',
      });
    });
  });

  describe('Expired token', () => {
    it('should return 401 with "Token has expired" for expired token', async () => {
      const expiredToken = jwt.sign(
        {
          id: 'user123',
          email: 'test@example.com',
          role: 'user',
        },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const req = createMockRequest({ headers: { authorization: `Bearer ${expiredToken}` } });
      const res = createMockResponse();

      await authenticate(req, res, next);

      expect(res.getStatusCode()).toBe(401);
      expect(res.getBody().data.errors[0]).toMatchObject({
        type: 'UNAUTHORIZED',
        message: 'Token has expired',
      });
    });
  });

  describe('Valid token', () => {
    it('should call next() and set req.user for valid token', async () => {
      const validToken = jwt.sign(
        {
          id: 'user123',
          email: 'test@example.com',
          role: 'user',
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const req = createMockRequest({ headers: { authorization: `Bearer ${validToken}` } });
      const res = createMockResponse();
      let nextCalled = false;

      await authenticate(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(req.user).toMatchObject({
        id: 'user123',
        email: 'test@example.com',
        role: 'user',
      });
      expect(res.hasHeadersSent()).toBe(false);
    });

    it('should include custom payload fields in req.user', async () => {
      const validToken = jwt.sign(
        {
          id: 'custom-id',
          email: 'custom@example.com',
          role: 'admin',
          name: 'Custom User',
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const req = createMockRequest({ headers: { authorization: `Bearer ${validToken}` } });
      const res = createMockResponse();
      let nextCalled = false;

      await authenticate(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(req.user).toMatchObject({
        id: 'custom-id',
        email: 'custom@example.com',
        role: 'admin',
      });
      expect(req.user).not.toHaveProperty('name');
    });
  });

  describe('Token with wrong secret', () => {
    it('should return 401 with "Invalid authentication token" when secret does not match', async () => {
      const wrongToken = jwt.sign(
        {
          id: 'user123',
          email: 'test@example.com',
          role: 'user',
        },
        'wrong-secret',
        { expiresIn: '1h' }
      );

      const req = createMockRequest({ headers: { authorization: `Bearer ${wrongToken}` } });
      const res = createMockResponse();

      await authenticate(req, res, next);

      expect(res.getStatusCode()).toBe(401);
      expect(res.getBody().data.errors[0]).toMatchObject({
        type: 'UNAUTHORIZED',
        message: 'Invalid authentication token',
      });
    });
  });
});
