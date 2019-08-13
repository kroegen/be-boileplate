const Comment = require('../../models/Comment');

exports.createComment = async(req, res) => {
    try {
        const { author, content } = req.body;
        const comment = await new Comment({ author, content });

        await comment.save();
        await res.send({ status: 1, data: { comment } });
    } catch (error) {
       return next(error);
    }
};
