import { Schema } from '#src/mongoose.js';
import { v4 as uuidv4 } from 'uuid';

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
  comments: [
    {
      type: String,
      ref: 'CommentModel',
    },
  ],
});

export default PostSchema;
