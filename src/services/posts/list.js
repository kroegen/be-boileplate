// TODO(architecture): Return post data to the controller instead of reading req or writing HTTP responses here.
import Post from '../../models/Post.js';
import { HTTP_OK, HTTP_BAD_REQUEST, STATUS_SUCCESS, STATUS_FAILURE } from '../../utils/statusCodes.js';
import { dumpPost } from '../../utils/dump.js';

export const getPosts = async (req, res) => {
  try {
    const posts = (await Post.find()).map((post) => dumpPost(post));
    res.status(HTTP_OK).json({ status: STATUS_SUCCESS, data: { posts } });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: STATUS_FAILURE,
      data: { errors: [error.message] },
    });
  }
};
