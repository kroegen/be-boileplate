import { Schema, model, type HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface CommentData {
  _id: string;
  author: string;
  content?: string | null;
  postId?: string | null;
}

export type CommentDocument = HydratedDocument<CommentData>;

const CommentSchema = new Schema<CommentData>({
  _id: {
    type: String,
    default: () => uuidv4(),
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

const CommentModel = model<CommentData>('CommentModel', CommentSchema);
export default CommentModel;
export { CommentModel };
