import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const CommentSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  author: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    ref: 'Post',
  },
});

export default mongoose.model('CommentModel', CommentSchema);
