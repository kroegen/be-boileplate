const Post  = require('../../models/Post');
const utils = require('../../utils');

exports.getPosts = async (req, res) => {
    try {
        const posts = (await Post.find()).map(post => utils.dump.dumpPost(post));

        await res.send({ status: 1, data: { posts } });
    } catch (error) {
       return next(error);
    }
}
