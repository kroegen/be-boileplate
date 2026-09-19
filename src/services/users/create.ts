import User, { type UserDocument } from '#src/models/User.js';
import { dumpUser, type DumpedUser } from '#src/utils/dump.js';
import { userCreateSchema } from '#src/schemas/users.js';

export interface CreateUserSuccess {
  status: 'SUCCESS';
  data: { user: DumpedUser };
  statusCode: 201;
}

export interface CreateUserFailureValidation {
  status: 'FAILURE';
  data: { errors: Array<{ param: string; message: string }>; message: 'Validation failed' };
  statusCode: 400;
}

export interface CreateUserFailureDuplicate {
  status: 'FAILURE';
  data: { errors: Array<{ param: 'email'; message: string }>; message: 'User creation failed' };
  statusCode: 409;
}

export interface CreateUserFailureError {
  status: 'FAILURE';
  data: { errors: string[] };
  statusCode: 400;
}

export type CreateUserResult =
  | CreateUserSuccess
  | CreateUserFailureValidation
  | CreateUserFailureDuplicate
  | CreateUserFailureError;

export const createUser = async (userData: unknown): Promise<CreateUserResult> => {
  const result = userCreateSchema.safeParse(userData);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      param: err.path.join('.'),
      message: err.message,
    }));
    return {
      status: 'FAILURE',
      data: { errors, message: 'Validation failed' },
      statusCode: 400,
    };
  }

  const { name, email, password } = result.data;

  let user: UserDocument;
  try {
    user = new User({ name, email });
    if (password !== undefined) {
      user.password = password;
    }
    await user.save();
  } catch (error: unknown) {
    // Handle duplicate email error from MongoDB
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      return {
        status: 'FAILURE',
        data: {
          errors: [{ param: 'email', message: 'Email already exists' }],
          message: 'User creation failed',
        },
        statusCode: 409,
      };
    }

    return {
      status: 'FAILURE',
      data: { errors: [error instanceof Error ? error.message : String(error)] },
      statusCode: 400,
    };
  }

  return { status: 'SUCCESS', data: { user: dumpUser(user) }, statusCode: 201 };
};
