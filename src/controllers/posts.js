const posts = require('../services/posts');

module.exports = {
    create : posts.createPost,
    list   : posts.getPosts,
}
