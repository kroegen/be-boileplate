const mongoose = require('mongoose');
const uuidv4   = require('uuid/v4');
const Schema   = mongoose.Schema;

const CommentSchema = new Schema({
    _id: {
        type    : String,
        default : uuidv4,
    },
    author: {
        type     : String,
        required : true,
    },
    postId: {
        type : Schema.Types.ObjectId,
        ref  : 'Post',
    },
});

module.exports = mongoose.model('CommentModel', CommentSchema);
