const Comment = require('../../models/Comment');
const utils   = require('../../utils');
const { STATUS_SUCCESS, STATUS_FAILURE, HTTP_BAD_REQUEST } = utils.statusCodes;

exports.getComments = async (req, res) => {
    try {
        const comments = (await Comment.find()).map(comment => utils.dump.dumpComment(comment));

        await res.send({ status: STATUS_SUCCESS, data: { comments } });
    } catch (error) {
        return res.status(HTTP_BAD_REQUEST).send({ status: STATUS_FAILURE, data: { errors: [error.message] } });
    }
}
