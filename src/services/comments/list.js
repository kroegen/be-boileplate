import Comment from '#src/models/Comment.js';
import { dumpComment } from '#src/utils/dump.js';

export const getComments = async () => {
  const comments = (await Comment.find()).map((comment) => dumpComment(comment));
  return { status: 'SUCCESS', data: { comments }, statusCode: 200 };
};
