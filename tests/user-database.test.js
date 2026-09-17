import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { setUpConnection, disconnect } from '#src/mongoose.js';
import User from '#src/models/User.js';
import { dumpUser } from '#src/utils/dump.js';
import { hashPassword, isArgon2idHash } from '#src/utils/auth.js';

const testDbUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/be-boilerplate-test';
const userDbUri = testDbUri.replace(/\/[^/]+$/, '/be-boilerplate-user-regression');
const expectedDbName = userDbUri.split('/').pop();

let emailSeq = 0;
const uniqueEmail = (prefix) => `${prefix}-${Date.now()}-${emailSeq++}@example.com`;

describe('User database regressions', () => {
  beforeAll(async () => {
    await setUpConnection(userDbUri);
    expect(mongoose.connection.name).toBe(expectedDbName);
    // Ensure the unique email index exists before testing enforcement.
    await User.init();
    await User.ensureIndexes();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await disconnect();
  });

  it('enforces the unique email index', async () => {
    const email = uniqueEmail('unique');
    await new User({ name: 'First', email }).save();

    await expect(new User({ name: 'Second', email }).save()).rejects.toMatchObject({ code: 11000 });

    const indexes = await User.collection.indexes();
    expect(indexes.some((index) => index.name === 'email_1' && index.unique)).toBe(true);
  });

  it('rejects a user without the required email', async () => {
    await expect(new User({ name: 'No Email' }).save()).rejects.toMatchObject({
      name: 'ValidationError',
    });
  });

  it('rejects invalid role and status enum values', async () => {
    await expect(
      new User({ email: uniqueEmail('role'), role: 'SUPERUSER' }).save()
    ).rejects.toMatchObject({ name: 'ValidationError' });

    await expect(
      new User({ email: uniqueEmail('status'), status: 'DELETED' }).save()
    ).rejects.toMatchObject({ name: 'ValidationError' });
  });

  it('sets createdAt and updatedAt timestamps', async () => {
    const user = await new User({ name: 'Timestamps', email: uniqueEmail('ts') }).save();

    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
    expect(user.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('serializes with a string UUID id and hides credentials in the API dump', async () => {
    const user = await new User({
      name: 'Serial',
      email: uniqueEmail('serial'),
      password: 'secret',
    }).save();

    expect(typeof user.id).toBe('string');
    expect(user.id).toBe(user._id);
    expect(await user.checkPassword('secret')).toBe(true);

    const dump = dumpUser(user);
    expect(dump).toEqual({
      id: user._id,
      name: 'Serial',
      status: 'ACTIVE',
      role: 'USER',
      email: user.email,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
    expect(dump).not.toHaveProperty('passwordHash');
    expect(dump).not.toHaveProperty('salt');
  });

  it('loads pre-existing records written with UUID string _id without conversion', async () => {
    const existingId = '11111111-2222-3333-4444-555555555555';
    const email = uniqueEmail('existing');
    const passwordHash = await hashPassword('existing-pass');

    await mongoose.connection.collection(User.collection.name).insertOne({
      _id: existingId,
      name: 'Existing',
      email,
      passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      createdAt: new Date('2020-01-01T00:00:00Z'),
      updatedAt: new Date('2020-01-01T00:00:00Z'),
    });

    const found = await User.findOne({ email });

    expect(found._id).toBe(existingId);
    expect(found.email).toBe(email);
    expect(isArgon2idHash(found.passwordHash)).toBe(true);
    expect(await found.checkPassword('existing-pass')).toBe(true);
    expect(await found.checkPassword('wrong-password')).toBe(false);
  });
});
