// TODO(architecture): Move request/response handling to the controller and return an application result or error.
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { dumpUser } from '../../utils/index.js';
import config from '../../bin/config.json' with { type: 'json' };
import { STATUS_SUCCESS, STATUS_FAILURE } from '../../utils/statusCodes.js';

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour in milliseconds

export const createSession = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && user.checkPassword(password)) {
      const token = jwt.sign(dumpUser(user), config.app.secret, {
        expiresIn: TOKEN_EXPIRY_MS,
      });

      await res.send({ status: STATUS_SUCCESS, data: { token } });
    } else {
      await res.send({
        status: STATUS_FAILURE,
        data: {
          errors: [
            {
              param: 'password',
              message: 'Invaild password',
            },
          ],
          message: 'Invaild param(s)',
        },
      });
    }
  } catch (error) {
    return next(error);
  }
};
