const Post  = require('../../models/Post');
const utils = require('../../utils');
const { STATUS_SUCCESS } = utils.statusCodes;

exports.getPosts = async (req, res) => {
    try {
        const posts = (await Post.find()).map(post => utils.dump.dumpPost(post));

        await res.send({ status: STATUS_SUCCESS, data: { posts } });
    } catch (error) {
       return next(error);
    }
}
