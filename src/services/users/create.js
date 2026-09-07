const User = require('../../models/User');
const { STATUS_SUCCESS, STATUS_FAILURE } = require('../../utils').statusCodes;

exports.createUser = async(req, res) => {
    try {
        const { name, email } = req.body;
        const user = await new User({ name, email });

        await user.save();
        await res.send({ status: STATUS_SUCCESS, data: { user } });
    } catch (error) {
        return res.status(400).send({ status: STATUS_FAILURE, data: { errors: [error.message] } });
    }
};
