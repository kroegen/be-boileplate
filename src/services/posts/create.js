const Post = require('../../models/Post');
const { STATUS_SUCCESS, STATUS_FAILURE } = require('../../utils').statusCodes;

exports.createPost = async(req, res) => {
    try {
        const { author, content } = req.body;
        const post = await new Post({ author, content });

        await post.save();
        await res.send({ status: STATUS_SUCCESS, data: { post } });
    } catch (error) {
        return res.status(400).send({ status: STATUS_FAILURE, data: { errors: [error.message] } });
    }
};
