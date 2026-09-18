// TODO(architecture): Accept plain input, validate application rules, return data, and leave HTTP responses to the controller.
import User from '#src/models/User.js';
import {
  HTTP_CREATED,
  HTTP_CONFLICT,
  HTTP_BAD_REQUEST,
  STATUS_SUCCESS,
  STATUS_FAILURE,
} from '#src/utils/statusCodes.js';
import { dumpUser } from '#src/utils/dump.js';
import { userCreateSchema } from '#src/schemas/users.js';

export const createUser = async (req, res) => {
  const result = userCreateSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      param: err.path.join('.'),
      message: err.message,
    }));

    return res.status(HTTP_BAD_REQUEST).json({
      status: STATUS_FAILURE,
      data: { errors, message: 'Validation failed' },
    });
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
      return res.status(HTTP_CONFLICT).json({
        status: STATUS_FAILURE,
        data: {
          errors: [{ param: 'email', message: 'Email already exists' }],
          message: 'User creation failed',
        },
      });
    }

    return res.status(HTTP_BAD_REQUEST).json({
      status: STATUS_FAILURE,
      data: { errors: [error.message] },
    });
  }

  res.status(HTTP_CREATED).json({ status: STATUS_SUCCESS, data: { user: dumpUser(user) } });
};
