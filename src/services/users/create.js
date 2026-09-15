// TODO(architecture): Accept plain input, validate application rules, return data, and leave HTTP responses to the controller.
import User from '../../models/User.js';
import { HTTP_CREATED, HTTP_BAD_REQUEST, STATUS_SUCCESS, STATUS_FAILURE } from '../../utils/statusCodes.js';
import { dumpUser } from '../../utils/dump.js';

export const createUser = async (req, res) => {
  const { name, email } = req.body;

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

  const user = await new User({ name, email });

  try {
    await user.save();
    res.status(HTTP_CREATED).json({ status: STATUS_SUCCESS, data: { user: dumpUser(user) } });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: STATUS_FAILURE,
      data: { errors: [error.message] },
    });
  }
};
