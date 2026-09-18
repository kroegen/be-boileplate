import { createPost, getPosts } from '#src/services/posts/index.js';

export const create = async (req, res) => {
  const result = await createPost(req.body);
  res.status(result.statusCode).json({
    status: result.status === 'SUCCESS' ? 1 : 0,
    data: result.data,
  });
};

export const list = async (req, res) => {
  const result = await getPosts();
  res.status(result.statusCode).json({
    status: result.status === 'SUCCESS' ? 1 : 0,
    data: result.data,
  });
};
