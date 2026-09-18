import { createComment, getComments } from '#src/services/comments/index.js';

export const create = async (req, res) => {
  const result = await createComment(req.body);
  res.status(result.statusCode).json({
    status: result.status === 'SUCCESS' ? 1 : 0,
    data: result.data,
  });
};

export const list = async (req, res) => {
  const result = await getComments();
  res.status(result.statusCode).json({
    status: result.status === 'SUCCESS' ? 1 : 0,
    data: result.data,
  });
};
