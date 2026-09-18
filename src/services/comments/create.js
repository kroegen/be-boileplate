// TODO(architecture): Accept plain input, validate application rules, return data, and leave HTTP responses to the controller.
import Comment from '#src/models/Comment.js';
import {
  HTTP_CREATED,
  HTTP_BAD_REQUEST,
  STATUS_SUCCESS,
  STATUS_FAILURE,
} from '#src/utils/statusCodes.js';
import { dumpComment } from '#src/utils/dump.js';
import { commentCreateSchema } from '#src/schemas/comments.js';

export const createComment = async (req, res) => {
  const result = commentCreateSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      param: err.path.join('.'),
      message: err.message,
    }));

    return res.status(HTTP_BAD_REQUEST).json({
      status: STATUS_FAILURE,
      data: { errors, message: 'Validation failed' },
    });
  }

  const { author, content } = result.data;

  const comment = await new Comment({ author, content });

  try {
    await comment.save();
    res
      .status(HTTP_CREATED)
      .json({ status: STATUS_SUCCESS, data: { comment: dumpComment(comment) } });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: STATUS_FAILURE,
      data: { errors: [error.message] },
    });
  }
};
