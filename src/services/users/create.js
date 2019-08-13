const User = require('../../models/User');

exports.createUser = async(req, res) => {
    try {
        const { name, email } = req.body;
        const user = await new User({ name, email });

        await user.save();
        await res.send({ status: 1, data: { user } });
    } catch (error) {
       return next(error);
    }
};
