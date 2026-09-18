import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { getConfig } from '#src/config/index.js';

const cliScript = fileURLToPath(new URL('../src/cli/add-user.js', import.meta.url));

describe('configuration', () => {
  beforeEach(() => {
    vi.stubEnv('MONGODB_URI', 'mongodb://localhost:27017/be-boilerplate-test');
    vi.stubEnv('JWT_SECRET', 'test-secret');
    vi.stubEnv('PORT', '3000');
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('CORS_ORIGIN', 'http://localhost:3000');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('rejects an empty MongoDB URI', () => {
    vi.stubEnv('MONGODB_URI', '  ');

    expect(() => getConfig()).toThrow('Missing required environment variable: MONGODB_URI');
  });

  it('rejects a port with nonnumeric characters', () => {
    vi.stubEnv('PORT', '3000junk');

    expect(() => getConfig()).toThrow('Invalid PORT: 3000junk');
  });

  it('returns a numeric port', () => {
    expect(getConfig().port).toBe(3000);
  });

  it('shows CLI help without server configuration', () => {
    const result = spawnSync(process.execPath, [cliScript, '--help'], {
      env: {},
      encoding: 'utf8',
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('Usage:');
    expect(result.stderr).toBe('');
  });
});
