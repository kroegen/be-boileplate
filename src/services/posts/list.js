import Post from '#src/models/Post.js';
import { dumpPost } from '#src/utils/dump.js';

export const getPosts = async () => {
  const posts = (await Post.find()).map((post) => dumpPost(post));
  return { status: 'SUCCESS', data: { posts }, statusCode: 200 };
};
