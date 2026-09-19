import Comment from '#src/models/Comment.js';
import { dumpComment, type DumpedComment } from '#src/utils/dump.js';
import { commentCreateSchema } from '#src/schemas/comments.js';

export interface CreateCommentSuccess {
  status: 'SUCCESS';
  data: { comment: DumpedComment };
  statusCode: 201;
}

export interface CreateCommentFailureValidation {
  status: 'FAILURE';
  data: { errors: Array<{ param: string; message: string }>; message: 'Validation failed' };
  statusCode: 400;
}

export interface CreateCommentFailureError {
  status: 'FAILURE';
  data: { errors: string[] };
  statusCode: 400;
}

export type CreateCommentResult =
  CreateCommentSuccess | CreateCommentFailureValidation | CreateCommentFailureError;

export const createComment = async (commentData: unknown): Promise<CreateCommentResult> => {
  const result = commentCreateSchema.safeParse(commentData);

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

  const comment = new Comment({ author, content });

  try {
    await comment.save();
    return { status: 'SUCCESS', data: { comment: dumpComment(comment) }, statusCode: 201 };
  } catch (error: unknown) {
    return {
      status: 'FAILURE',
      data: { errors: [error instanceof Error ? error.message : String(error)] },
      statusCode: 400,
    };
  }
};
