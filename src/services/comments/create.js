const Comment = require('../../models/Comment');
const { STATUS_SUCCESS } = require('../../utils').statusCodes;

exports.createComment = async(req, res) => {
    const { author, content } = req.body;
    const comment = await new Comment({ author, content });

    await comment.save();
    await res.send({ status: STATUS_SUCCESS, data: { comment } });
};
