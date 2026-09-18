import Comment from '#src/models/Comment.js';
import { dumpComment } from '#src/utils/dump.js';
import { commentCreateSchema } from '#src/schemas/comments.js';

export const createComment = async (commentData) => {
  const result = commentCreateSchema.safeParse(commentData);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      param: err.path.join('.'),
      message: err.message,
    }));
    return { status: 'FAILURE', data: { errors, message: 'Validation failed' }, statusCode: 400 };
  }

  const { author, content } = result.data;

  const comment = await new Comment({ author, content });

  try {
    await comment.save();
    return { status: 'SUCCESS', data: { comment: dumpComment(comment) }, statusCode: 201 };
  } catch (error) {
    return { status: 'FAILURE', data: { errors: [error.message] }, statusCode: 400 };
  }
};
