// TODO(architecture): Accept plain input, validate application rules, return data, and leave HTTP responses to the controller.
import Post from '#src/models/Post.js';
import { HTTP_CREATED, HTTP_BAD_REQUEST, STATUS_SUCCESS, STATUS_FAILURE } from '#src/utils/statusCodes.js';
import { dumpPost } from '#src/utils/dump.js';

export const createPost = async (req, res) => {
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

  const post = await new Post({ author, content });

  try {
    await post.save();
    res.status(HTTP_CREATED).json({ status: STATUS_SUCCESS, data: { post: dumpPost(post) } });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: STATUS_FAILURE,
      data: { errors: [error.message] },
    });
  }
};
