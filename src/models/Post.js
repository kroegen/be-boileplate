const mongoose = require('mongoose');
const uuidv4   = require('uuid/v4');
const Schema   = mongoose.Schema;

const PostSchema = new Schema({
    _id: {
        type: String,
        default: uuidv4,
    },
    author: {
        type: String,
        required: true,
    },
    content: {
        type: String,
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    }],
});

module.exports = mongoose.model('PostModel', PostSchema);
