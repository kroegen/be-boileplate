const User = require('../../models/User');
const { STATUS_SUCCESS } = require('../../utils').statusCodes;
const { dumpUser } = require('../../utils').dump;

exports.createUser = async(req, res) => {
    const { name, email } = req.body;
    const user = await new User({ name, email });

    await user.save();
    await res.send({ status: STATUS_SUCCESS, data: { user: dumpUser(user) } });
};
