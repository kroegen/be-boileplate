const Comment = require('../../models/Comment');
const utils   = require('../../utils');

exports.getComments = async (req, res) => {
    try {
        const comments = (await Comment.find()).map(comment => utils.dump.dumpComment(comment));

        await res.send({ status: 1, data: { comments } });
    } catch (error) {
       return next(error);
    }
}
