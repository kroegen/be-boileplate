import { describe, it, expect } from 'vitest';
import { sanitizeObject, SENSITIVE_USER_FIELDS } from '#src/middleware/sanitize.js';

describe('Response Sanitization Middleware', () => {
  describe('SENSITIVE_USER_FIELDS', () => {
    it('should contain the expected sensitive fields', () => {
      expect(SENSITIVE_USER_FIELDS).toEqual(['passwordHash', 'salt', 'password']);
    });
  });

  describe('sanitizeObject', () => {
    it('should remove passwordHash from user objects', () => {
      const user = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=1$...',
        salt: 'some-salt-value',
        role: 'USER',
      };

      const sanitized = sanitizeObject(user);

      expect(sanitized).not.toHaveProperty('passwordHash');
      expect(sanitized).not.toHaveProperty('salt');
      expect(sanitized).toEqual({
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER',
      });
    });

    it('should handle nested objects', () => {
      const data = {
        user: {
          id: '123',
          passwordHash: 'hidden',
          profile: {
            avatar: 'avatar.png',
            secretToken: 'secret',
          },
        },
        passwordHash: 'top-level-hidden',
      };

      const sanitized = sanitizeObject(data);

      expect(sanitized).toEqual({
        user: {
          id: '123',
          profile: {
            avatar: 'avatar.png',
            secretToken: 'secret',
          },
        },
      });
    });

    it('should handle arrays', () => {
      const data = {
        users: [
          { id: '1', passwordHash: 'hidden1' },
          { id: '2', passwordHash: 'hidden2' },
          { id: '3', passwordHash: 'hidden3' },
        ],
      };

      const sanitized = sanitizeObject(data);

      expect(sanitized.users).toEqual([
        { id: '1' },
        { id: '2' },
        { id: '3' },
      ]);
    });

    it('should preserve non-sensitive fields', () => {
      const data = {
        id: '123',
        name: 'Test',
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00Z',
        status: 'ACTIVE',
        role: 'USER',
        passwordHash: 'should-be-removed',
      };

      const sanitized = sanitizeObject(data);

      expect(sanitized).toMatchObject({
        id: '123',
        name: 'Test',
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00Z',
        status: 'ACTIVE',
        role: 'USER',
      });
      expect(sanitized).not.toHaveProperty('passwordHash');
    });

    it('should handle null and undefined values', () => {
      const data = {
        user: null,
        profile: undefined,
        name: 'Test',
        passwordHash: 'hidden',
      };

      const sanitized = sanitizeObject(data);

      expect(sanitized).toEqual({
        user: null,
        profile: undefined,
        name: 'Test',
      });
    });

    it('should handle empty objects and arrays', () => {
      const data = {
        emptyObj: {},
        emptyArr: [],
        passwordHash: 'hidden',
      };

      const sanitized = sanitizeObject(data);

      expect(sanitized).toEqual({
        emptyObj: {},
        emptyArr: [],
      });
    });

    it('should handle primitives', () => {
      expect(sanitizeObject('string')).toBe('string');
      expect(sanitizeObject(123)).toBe(123);
      expect(sanitizeObject(true)).toBe(true);
      expect(sanitizeObject(false)).toBe(false);
    });

    it('should sanitize error response bodies', () => {
      const errorResponse = {
        status: 0,
        data: {
          errors: [
            {
              type: 'UNAUTHORIZED',
              message: 'Invalid credentials',
              passwordHash: 'leaked-hash',
            },
          ],
          message: 'Invalid credentials',
          passwordHash: 'leaked-top-level',
        },
        statusCode: 401,
      };

      const sanitized = sanitizeObject(errorResponse);

      expect(sanitized.data.errors[0]).not.toHaveProperty('passwordHash');
      expect(sanitized).not.toHaveProperty('passwordHash');
      expect(sanitized).toEqual({
        status: 0,
        data: {
          errors: [{ type: 'UNAUTHORIZED', message: 'Invalid credentials' }],
          message: 'Invalid credentials',
        },
        statusCode: 401,
      });
    });

    it('should handle deeply nested structures', () => {
      const data = {
        level1: {
          level2: {
            level3: {
              user: {
                passwordHash: 'deeply-hidden',
                name: 'Deep User',
              },
            },
          },
        },
      };

      const sanitized = sanitizeObject(data);

      expect(sanitized.level1.level2.level3.user).toEqual({
        name: 'Deep User',
      });
    });
  });
});
