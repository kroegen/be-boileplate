import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { setUpConnection, disconnect } from '#src/mongoose.js';
import User from '#src/models/User.js';

const execFileAsync = promisify(execFile);
const cliScript = fileURLToPath(new URL('../src/bin/add_user.js', import.meta.url));

const testDbUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/be-boilerplate-test';
const cliDbUri = testDbUri.replace(/\/[^/]+$/, '/be-boilerplate-cli-regression');
const expectedDbName = cliDbUri.split('/').pop();

const runCli = async (args) => {
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, [cliScript, ...args], {
      env: { ...process.env, MONGODB_URI: cliDbUri },
      timeout: 20000,
    });
    return { status: 0, stdout, stderr };
  } catch (err) {
    return {
      status: err.code,
      stdout: err.stdout ? err.stdout.toString() : '',
      stderr: err.stderr ? err.stderr.toString() : '',
    };
  }
};

let emailSeq = 0;
const uniqueEmail = (prefix) => `${prefix}-${Date.now()}-${emailSeq++}@example.com`;

describe('add_user CLI regressions', () => {
  beforeAll(async () => {
    await setUpConnection(cliDbUri);
    expect(mongoose.connection.name).toBe(expectedDbName);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await disconnect();
  });

  it('prints usage and exits 1 for --help', async () => {
    const { status, stdout } = await runCli(['--help']);

    expect(status).toBe(1);
    expect(stdout).toContain('Usage:');
    expect(stdout).toContain('--email=<email>');
  }, 30000);

  it('prints usage and exits 1 when required args are missing', async () => {
    const { status, stdout } = await runCli(['--email=someone@example.com']);

    expect(status).toBe(1);
    expect(stdout).toContain('Usage:');
  }, 30000);

  it('creates a user with the given name, role, and password', async () => {
    const email = uniqueEmail('cli');
    const { status, stdout } = await runCli([
      `--email=${email}`,
      '--password=cli-secret',
      '--name=CLI User',
      '--role=ADMIN',
    ]);

    expect(status).toBe(0);
    expect(stdout).toContain('Success!');

    const user = await User.findOne({ email });
    expect(user).not.toBeNull();
    expect(user.name).toBe('CLI User');
    expect(user.role).toBe('ADMIN');
    expect(user.status).toBe('ACTIVE');
    expect(user.salt).not.toBe('');
    expect(user.passwordHash).not.toBe('');
    expect(user.checkPassword('cli-secret')).toBe(true);
    expect(user.checkPassword('wrong-password')).toBe(false);
  }, 30000);

  it('does not persist a second user with the same email', async () => {
    const email = uniqueEmail('dup');
    const first = await runCli([
      `--email=${email}`,
      '--password=first',
      '--name=First',
      '--role=USER',
    ]);
    expect(first.status).toBe(0);

    const { status, stderr } = await runCli([
      `--email=${email}`,
      '--password=second',
      '--name=Second',
      '--role=USER',
    ]);

    expect(status).toBe(1);
    expect(stderr).toContain('duplicate key');

    const users = await User.find({ email });
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe('First');
  }, 30000);

  it('applies the default USER role when --role is omitted', async () => {
    const email = uniqueEmail('norole');
    const { status, stdout } = await runCli([
      `--email=${email}`,
      '--password=secret',
      '--name=No Role',
    ]);

    expect(status).toBe(0);
    expect(stdout).toContain('Success!');

    const user = await User.findOne({ email });
    expect(user).not.toBeNull();
    expect(user.role).toBe('USER');
  }, 30000);
});
