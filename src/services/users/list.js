// TODO(architecture): Return user data to the controller instead of reading req or writing HTTP responses here.
import User from '../../models/User.js';
import { HTTP_OK, HTTP_BAD_REQUEST, STATUS_SUCCESS, STATUS_FAILURE } from '../../utils/statusCodes.js';
import { dumpUser } from '../../utils/dump.js';

export const getUsers = async (req, res) => {
  try {
    const users = (await User.find()).map((user) => dumpUser(user));
    res.status(HTTP_OK).json({ status: STATUS_SUCCESS, data: { users } });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: STATUS_FAILURE,
      data: { errors: [error.message] },
    });
  }
};
