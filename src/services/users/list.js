import User from '../../models/User.js';
import { STATUS_SUCCESS, STATUS_FAILURE, HTTP_BAD_REQUEST } from '../../utils/statusCodes.js';
import { dumpUser } from '../../utils/dump.js';

export const getUsers = async (req, res) => {
  try {
    const users = (await User.find()).map((user) => dumpUser(user));

    await res.send({ status: STATUS_SUCCESS, data: { users } });
  } catch (error) {
    return res
      .status(HTTP_BAD_REQUEST)
      .send({ status: STATUS_FAILURE, data: { errors: [error.message] } });
  }
};
