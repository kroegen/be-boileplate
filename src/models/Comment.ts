import { Schema } from '#src/mongoose.js';
import { v4 as uuidv4 } from 'uuid';

const CommentSchema = new Schema({
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
  postId: {
    type: String,
    ref: 'PostModel',
  },
});

export default CommentSchema;
