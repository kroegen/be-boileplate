// TODO(architecture): Return comment data to the controller instead of reading req or writing HTTP responses here.
import Comment from '#src/models/Comment.js';
import { HTTP_OK, HTTP_BAD_REQUEST, STATUS_SUCCESS, STATUS_FAILURE } from '#src/utils/statusCodes.js';
import { dumpComment } from '#src/utils/dump.js';

export const getComments = async (req, res) => {
  try {
    const comments = (await Comment.find()).map((comment) => dumpComment(comment));
    res.status(HTTP_OK).json({ status: STATUS_SUCCESS, data: { comments } });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: STATUS_FAILURE,
      data: { errors: [error.message] },
    });
  }
};
