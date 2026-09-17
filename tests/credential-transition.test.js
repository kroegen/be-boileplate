import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { setUpConnection, disconnect } from '#src/mongoose.js';
import User from '#src/models/User.js';
import { hashPassword, isArgon2idHash, verifyPassword } from '#src/utils/auth.js';

const testDbUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/be-boilerplate-test';
const testDbUriAuth = testDbUri.replace(/\/[^/]+$/, '/be-boilerplate-auth');

describe('Argon2id credential utilities', () => {
  it('hashes and verifies a password', async () => {
    const hash = await hashPassword('test-password');

    expect(isArgon2idHash(hash)).toBe(true);
    expect(await verifyPassword('test-password', hash)).toBe(true);
    expect(await verifyPassword('wrong-password', hash)).toBe(false);
  });

  it('rejects empty and non-string passwords', async () => {
    await expect(hashPassword('')).rejects.toThrow('Password must be a non-empty string');
    await expect(hashPassword(123)).rejects.toThrow('Password must be a non-empty string');
  });

  it('rejects empty, legacy, and malformed hashes', async () => {
    expect(await verifyPassword('password', '')).toBe(false);
    expect(await verifyPassword('password', 'a'.repeat(40))).toBe(false);
    expect(await verifyPassword('password', '$argon2id$invalid')).toBe(false);
    expect(isArgon2idHash(null)).toBe(false);
  });
});

describe('User credentials', () => {
  beforeAll(async () => {
    await setUpConnection(testDbUriAuth);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await disconnect();
  });

  it('hashes a password without storing the plaintext or a separate salt', async () => {
    const user = new User({
      name: 'Argon2 User',
      email: `argon2-${Date.now()}@example.com`,
      password: 'secure-password',
    });

    await user.save();

    expect(isArgon2idHash(user.passwordHash)).toBe(true);
    expect(user.$locals.password).toBeUndefined();
    expect(user.salt).toBeUndefined();
    expect(await user.checkPassword('secure-password')).toBe(true);
    expect(await user.checkPassword('wrong-password')).toBe(false);

    const stored = await User.findById(user.id);
    expect(stored.password).toBeUndefined();
    expect(stored.salt).toBeUndefined();
  });

  it('changes a password on save', async () => {
    const user = await new User({
      name: 'Password Change',
      email: `change-${Date.now()}@example.com`,
      password: 'old-password',
    }).save();
    const oldHash = user.passwordHash;

    user.password = 'new-password';
    await user.save();

    expect(user.passwordHash).not.toBe(oldHash);
    expect(await user.checkPassword('old-password')).toBe(false);
    expect(await user.checkPassword('new-password')).toBe(true);
  });

  it('rejects login when the hash is empty', async () => {
    const user = await new User({
      name: 'No Password',
      email: `empty-${Date.now()}@example.com`,
    }).save();

    expect(await user.checkPassword('any-password')).toBe(false);
  });

  it('rejects an empty password before saving', async () => {
    const user = new User({
      name: 'Empty Password',
      email: `invalid-${Date.now()}@example.com`,
      password: '',
    });

    await expect(user.save()).rejects.toThrow('Password must be a non-empty string');
  });
});
