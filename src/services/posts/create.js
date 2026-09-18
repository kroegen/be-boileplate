// TODO(architecture): Accept plain input, validate application rules, return data, and leave HTTP responses to the controller.
import Post from '#src/models/Post.js';
import {
  HTTP_CREATED,
  HTTP_BAD_REQUEST,
  STATUS_SUCCESS,
  STATUS_FAILURE,
} from '#src/utils/statusCodes.js';
import { dumpPost } from '#src/utils/dump.js';
import { postCreateSchema } from '#src/schemas/posts.js';

export const createPost = async (req, res) => {
  const result = postCreateSchema.safeParse(req.body);

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
