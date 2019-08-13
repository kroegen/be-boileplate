const Post = require('../../models/Post');

exports.createPost = async(req, res) => {
    try {
        const { author, content } = req.body;
        const post = await new Post({ author, content });

        await post.save();
        await res.send({ status: 1, data: { post } });
    } catch (error) {
       return next(error);
    }
};
