const Comment = require('../../models/Comment');
const { STATUS_SUCCESS, STATUS_FAILURE } = require('../../utils').statusCodes;

exports.createComment = async(req, res) => {
    try {
        const { author, content } = req.body;
        const comment = await new Comment({ author, content });

        await comment.save();
        await res.send({ status: STATUS_SUCCESS, data: { comment } });
    } catch (error) {
        return res.status(400).send({ status: STATUS_FAILURE, data: { errors: [error.message] } });
    }
};
