import type { UserDocument } from '#src/models/User.js';
import type { PostDocument } from '#src/models/Post.js';
import type { CommentDocument } from '#src/models/Comment.js';

export interface DumpedUser {
  id: string;
  name?: string | null;
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING';
  role: 'ADMIN' | 'USER';
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DumpedPost {
  id: string;
  author: string;
  content?: string | null;
}

export interface DumpedComment {
  id: string;
  author: string;
  content?: string | null;
}

export function dumpUser(user: UserDocument): DumpedUser {
  return {
    id: user._id,
    name: user.name,
    status: user.status,
    role: user.role,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function dumpPost(post: PostDocument): DumpedPost {
  return {
    id: post._id,
    author: post.author,
    content: post.content,
  };
}

export function dumpComment(comment: CommentDocument): DumpedComment {
  return {
    id: comment._id,
    author: comment.author,
    content: comment.content,
  };
}
