import Post from '#src/models/Post.js';
import { dumpPost, type DumpedPost } from '#src/utils/dump.js';
import { postCreateSchema } from '#src/schemas/posts.js';

export interface CreatePostSuccess {
  status: 'SUCCESS';
  data: { post: DumpedPost };
  statusCode: 201;
}

export interface CreatePostFailureValidation {
  status: 'FAILURE';
  data: { errors: Array<{ param: string; message: string }>; message: 'Validation failed' };
  statusCode: 400;
}

export interface CreatePostFailureError {
  status: 'FAILURE';
  data: { errors: string[] };
  statusCode: 400;
}

export type CreatePostResult =
  CreatePostSuccess | CreatePostFailureValidation | CreatePostFailureError;

export const createPost = async (postData: unknown): Promise<CreatePostResult> => {
  const result = postCreateSchema.safeParse(postData);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      param: err.path.join('.'),
      message: err.message,
    }));
    return {
      status: 'FAILURE',
      data: { errors, message: 'Validation failed' },
      statusCode: 400,
    };
  }

  const { author, content } = result.data;

  const post = new Post({ author, content });

  try {
    await post.save();
    return { status: 'SUCCESS', data: { post: dumpPost(post) }, statusCode: 201 };
  } catch (error: unknown) {
    return {
      status: 'FAILURE',
      data: { errors: [error instanceof Error ? error.message : String(error)] },
      statusCode: 400,
    };
  }
};
