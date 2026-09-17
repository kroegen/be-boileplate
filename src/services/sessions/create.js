// TODO(architecture): Move request/response handling to the controller and return an application result or error.
import jwt from 'jsonwebtoken';
import User from '#src/models/User.js';
import { dumpUser } from '#src/utils/index.js';
import {
  HTTP_OK,
  HTTP_BAD_REQUEST,
  HTTP_UNAUTHORIZED,
  STATUS_SUCCESS,
  STATUS_FAILURE,
} from '#src/utils/statusCodes.js';

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour in milliseconds

export const createSession = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: STATUS_FAILURE,
        data: {
          errors: [
            { param: 'email', message: 'Email is required' },
            { param: 'password', message: 'Password is required' },
          ],
          message: 'Validation failed',
        },
      });
    }

    const user = await User.findOne({ email });

    if (user && user.status === 'ACTIVE' && (await user.checkPassword(password))) {
      const token = jwt.sign(dumpUser(user), process.env.JWT_SECRET, {
        expiresIn: TOKEN_EXPIRY_MS,
      });

      res.status(HTTP_OK).json({ status: STATUS_SUCCESS, data: { token } });
    } else {
      res.status(HTTP_UNAUTHORIZED).json({
        status: STATUS_FAILURE,
        data: {
          errors: [
            {
              param: 'password',
              message: 'Invalid password',
            },
          ],
          message: 'Invalid credentials',
        },
      });
    }
  } catch (error) {
    return next(error);
  }
};
