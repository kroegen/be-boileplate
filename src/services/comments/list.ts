import Comment from '#src/models/Comment.js';
import { dumpComment, type DumpedComment } from '#src/utils/dump.js';

export const getComments = async (): Promise<{
  status: 'SUCCESS';
  data: { comments: DumpedComment[] };
  statusCode: number;
}> => {
  const comments = (await Comment.find()).map(dumpComment);
  return { status: 'SUCCESS', data: { comments }, statusCode: 200 };
};
