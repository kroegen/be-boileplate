const jwt     = require('jsonwebtoken');
const User    = require('../../models/User');
const utils   = require('../../utils');
const { app } = require('../../bin/config.json');
const { STATUS_SUCCESS, STATUS_FAILURE } = utils.statusCodes;

exports.createSession = async(req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && user.checkPassword(password)) {
            const token = jwt.sign(utils.dump.dumpUser(user), app.secret, { expiresIn: '1h' });

            await res.send({ status: STATUS_SUCCESS, data: { token } });
        } else {
            await res.send({
                status: STATUS_FAILURE,
                data: {
                    errors  : [ {
                        param: 'password',
                        message: 'Invaild password'
                    } ],
                message : 'Invaild param(s)'
            } });
        }
    } catch (error) {
       return next(error);
    }
};
