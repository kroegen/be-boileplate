import User from '../../models/User.js';
import { STATUS_SUCCESS } from '../../utils/statusCodes.js';
import { dumpUser } from '../../utils/dump.js';

export const createUser = async (req, res) => {
  const { name, email } = req.body;
  const user = await new User({ name, email });

  await user.save();
  await res.send({ status: STATUS_SUCCESS, data: { user: dumpUser(user) } });
};
