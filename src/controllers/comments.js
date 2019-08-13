const comments = require('../services/comments');

module.exports = {
    create : comments.createComment,
    list   : comments.getComments,
}
