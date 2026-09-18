import User from '#src/models/User.js';
import { dumpUser } from '#src/utils/dump.js';
import { userCreateSchema } from '#src/schemas/users.js';

export const createUser = async (userData) => {
  const result = userCreateSchema.safeParse(userData);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      param: err.path.join('.'),
      message: err.message,
    }));
    return { status: 'FAILURE', data: { errors, message: 'Validation failed' }, statusCode: 400 };
  }

  const { name, email, password } = result.data;

  let user;
  try {
    user = new User({ name, email });
    if (password !== undefined) {
      user.password = password;
    }
    await user.save();
  } catch (error) {
    // Handle duplicate email error from MongoDB
    if (error.code === 11000) {
      return {
        status: 'FAILURE',
        data: {
          errors: [{ param: 'email', message: 'Email already exists' }],
          message: 'User creation failed',
        },
        statusCode: 409,
      };
    }

    return { status: 'FAILURE', data: { errors: [error.message] }, statusCode: 400 };
  }

  return { status: 'SUCCESS', data: { user: dumpUser(user) }, statusCode: 201 };
};
