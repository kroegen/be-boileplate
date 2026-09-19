import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

export function isArgon2idHash(hash: string): boolean {
  return typeof hash === 'string' && hash.startsWith('$argon2id$');
}

export async function hashPassword(password: string): Promise<string> {
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

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (typeof password !== 'string' || !isArgon2idHash(hash)) {
    return false;
  }

  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthRequest {
  headers: {
    authorization?: string;
  };
  user?: JwtPayload;
}

export async function authenticate(
  req: AuthRequest,
  res: { status: (code: number) => { json: (body: unknown) => void } },
  next: () => void
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      status: 0,
      data: { errors: [{ type: 'UNAUTHORIZED', message: 'Missing authentication token' }] },
    });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '', {
      algorithms: ['HS256'],
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    if (typeof decoded === 'object' && decoded !== null) {
      req.user = {
        id: decoded.id as string,
        email: decoded.email as string,
        role: decoded.role as string,
      };
    }
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: 0,
        data: { errors: [{ type: 'UNAUTHORIZED', message: 'Token has expired' }] },
      });
      return;
    }
    res.status(401).json({
      status: 0,
      data: { errors: [{ type: 'UNAUTHORIZED', message: 'Invalid authentication token' }] },
    });
  }
}
