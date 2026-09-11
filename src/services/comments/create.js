// TODO(architecture): Accept plain input, validate application rules, return data, and leave HTTP responses to the controller.
import Comment from '../../models/Comment.js';
import { STATUS_SUCCESS } from '../../utils/statusCodes.js';
import { dumpComment } from '../../utils/dump.js';

export const createComment = async (req, res) => {
  const { author, content } = req.body;
  const comment = await new Comment({ author, content });

  await comment.save();
  await res.send({ status: STATUS_SUCCESS, data: { comment: dumpComment(comment) } });
};
