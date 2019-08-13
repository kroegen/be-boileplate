const Post  = require('../../models/Post');
const utils = require('../../utils');

exports.getUsers = async (req, res) => {
    try {
        const users = (await User.find()).map(user => utils.dump.dumpUser(user));

        await res.send({ status: 1, data: { users } });
    } catch (error) {
       return next(error);
    }
}
