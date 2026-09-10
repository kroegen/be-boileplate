const User = require('../../models/User');
const utils = require('../../utils');
const { STATUS_SUCCESS, STATUS_FAILURE, HTTP_BAD_REQUEST } = utils.statusCodes;

exports.getUsers = async (req, res) => {
  try {
    const users = (await User.find()).map((user) => utils.dump.dumpUser(user));

    await res.send({ status: STATUS_SUCCESS, data: { users } });
  } catch (error) {
    return res
      .status(HTTP_BAD_REQUEST)
      .send({ status: STATUS_FAILURE, data: { errors: [error.message] } });
  }
};
