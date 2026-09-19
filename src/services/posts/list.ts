import Post from '#src/models/Post.js';
import { dumpPost, type DumpedPost } from '#src/utils/dump.js';

export const getPosts = async (): Promise<{
  status: 'SUCCESS';
  data: { posts: DumpedPost[] };
  statusCode: number;
}> => {
  const posts = (await Post.find()).map(dumpPost);
  return { status: 'SUCCESS', data: { posts }, statusCode: 200 };
};
