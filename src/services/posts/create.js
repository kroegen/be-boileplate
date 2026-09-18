import Post from '#src/models/Post.js';
import { dumpPost } from '#src/utils/dump.js';
import { postCreateSchema } from '#src/schemas/posts.js';

export const createPost = async (postData) => {
  const result = postCreateSchema.safeParse(postData);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      param: err.path.join('.'),
      message: err.message,
    }));
    return { status: 'FAILURE', data: { errors, message: 'Validation failed' }, statusCode: 400 };
  }

  const { author, content } = result.data;

  const post = await new Post({ author, content });

  try {
    await post.save();
    return { status: 'SUCCESS', data: { post: dumpPost(post) }, statusCode: 201 };
  } catch (error) {
    return { status: 'FAILURE', data: { errors: [error.message] }, statusCode: 400 };
  }
};
