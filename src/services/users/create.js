// TODO(architecture): Accept plain input, validate application rules, return data, and leave HTTP responses to the controller.
import User from '#src/models/User.js';
import {
  HTTP_CREATED,
  HTTP_BAD_REQUEST,
  STATUS_SUCCESS,
  STATUS_FAILURE,
} from '#src/utils/statusCodes.js';
import { dumpUser } from '#src/utils/dump.js';

export const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email) {
    return res.status(HTTP_BAD_REQUEST).json({
      status: STATUS_FAILURE,
      data: {
        errors: [
          { param: 'name', message: 'Name is required' },
          { param: 'email', message: 'Email is required' },
        ],
        message: 'Validation failed',
      },
    });
  }

  let user;
  try {
    user = new User({ name, email });
    if (password !== undefined) {
      user.password = password;
    }
    await user.save();
  } catch (error) {
    return res.status(HTTP_BAD_REQUEST).json({
      status: STATUS_FAILURE,
      data: { errors: [error.message] },
    });
  }

  res.status(HTTP_CREATED).json({ status: STATUS_SUCCESS, data: { user: dumpUser(user) } });
};
