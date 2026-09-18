import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

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

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 0,
      data: { errors: [{ type: 'UNAUTHORIZED', message: 'Missing authentication token' }] },
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 0,
        data: { errors: [{ type: 'UNAUTHORIZED', message: 'Token has expired' }] },
      });
    }
    return res.status(401).json({
      status: 0,
      data: { errors: [{ type: 'UNAUTHORIZED', message: 'Invalid authentication token' }] },
    });
  }
};
