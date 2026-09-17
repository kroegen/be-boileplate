import argon2 from 'argon2';

export function isArgon2idHash(hash) {
  return typeof hash === 'string' && hash.startsWith('$argon2id$');
}

export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password must be a non-empty string');
  }

  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });
}

export async function verifyPassword(password, hash) {
  if (typeof password !== 'string' || !isArgon2idHash(hash)) {
    return false;
  }

  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}
