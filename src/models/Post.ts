import { Schema, model, type HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface PostData {
  _id: string;
  author: string;
  content?: string | null;
  comments: string[];
}

export type PostDocument = HydratedDocument<PostData>;

const PostSchema = new Schema<PostData>({
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
  comments: [
    {
      type: String,
      ref: 'CommentModel',
    },
  ],
});

const PostModel = model<PostData>('PostModel', PostSchema);
export default PostModel;
export { PostModel };
