const Comment = require('../../models/Comment');
const utils   = require('../../utils');
const { STATUS_SUCCESS } = utils.statusCodes;

exports.getComments = async (req, res) => {
    try {
        const comments = (await Comment.find()).map(comment => utils.dump.dumpComment(comment));

        await res.send({ status: STATUS_SUCCESS, data: { comments } });
    } catch (error) {
       return next(error);
    }
}
