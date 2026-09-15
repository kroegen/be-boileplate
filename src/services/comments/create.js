// TODO(architecture): Accept plain input, validate application rules, return data, and leave HTTP responses to the controller.
import Comment from '#src/models/Comment.js';
import { HTTP_CREATED, HTTP_BAD_REQUEST, STATUS_SUCCESS, STATUS_FAILURE } from '#src/utils/statusCodes.js';
import { dumpComment } from '#src/utils/dump.js';

export const createComment = async (req, res) => {
  const { author, content } = req.body;

  if (!author || !content) {
    return res.status(HTTP_BAD_REQUEST).json({
      status: STATUS_FAILURE,
      data: {
        errors: [
          { param: 'author', message: 'Author is required' },
          { param: 'content', message: 'Content is required' },
        ],
        message: 'Validation failed',
      },
    });
  }

  const comment = await new Comment({ author, content });

  try {
    await comment.save();
    res.status(HTTP_CREATED).json({ status: STATUS_SUCCESS, data: { comment: dumpComment(comment) } });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: STATUS_FAILURE,
      data: { errors: [error.message] },
    });
  }
};
