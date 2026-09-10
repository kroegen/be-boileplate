import Comment from '../../models/Comment.js';
import { STATUS_SUCCESS, STATUS_FAILURE, HTTP_BAD_REQUEST } from '../../utils/statusCodes.js';
import { dumpComment } from '../../utils/dump.js';

export const getComments = async (req, res) => {
  try {
    const comments = (await Comment.find()).map((comment) => dumpComment(comment));

    await res.send({ status: STATUS_SUCCESS, data: { comments } });
  } catch (error) {
    return res
      .status(HTTP_BAD_REQUEST)
      .send({ status: STATUS_FAILURE, data: { errors: [error.message] } });
  }
};
