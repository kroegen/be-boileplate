import jwt from 'jsonwebtoken';
import User from '#src/models/User.js';
import { dumpUser } from '#src/utils/index.js';
import { sessionCreateSchema } from '#src/schemas/sessions.js';

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour in milliseconds

export const createSession = async (sessionData) => {
  const result = sessionCreateSchema.safeParse(sessionData);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      param: err.path.join('.'),
      message: err.message,
    }));
    return { status: 'FAILURE', data: { errors, message: 'Validation failed' }, statusCode: 400 };
  }

  const { email, password } = result.data;

  const user = await User.findOne({ email });

  if (user && user.status === 'ACTIVE' && (await user.checkPassword(password))) {
    const token = jwt.sign(dumpUser(user), process.env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY_MS,
    });

    return { status: 'SUCCESS', data: { token }, statusCode: 200 };
  } else {
    return {
      status: 'FAILURE',
      data: {
        errors: [
          {
            param: 'password',
            message: 'Invalid password',
          },
        ],
        message: 'Invalid credentials',
      },
      statusCode: 401,
    };
  }
};
