import Post from '../../models/Post.js';
import { STATUS_SUCCESS, STATUS_FAILURE, HTTP_BAD_REQUEST } from '../../utils/statusCodes.js';
import { dumpPost } from '../../utils/dump.js';

export const getPosts = async (req, res) => {
  try {
    const posts = (await Post.find()).map((post) => dumpPost(post));

    await res.send({ status: STATUS_SUCCESS, data: { posts } });
  } catch (error) {
    return res
      .status(HTTP_BAD_REQUEST)
      .send({ status: STATUS_FAILURE, data: { errors: [error.message] } });
  }
};
