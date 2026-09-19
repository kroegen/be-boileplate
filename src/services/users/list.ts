import User from '#src/models/User.js';
import { dumpUser, type DumpedUser } from '#src/utils/dump.js';

export const getUsers = async (): Promise<{
  status: 'SUCCESS';
  data: { users: DumpedUser[] };
  statusCode: number;
}> => {
  const users = (await User.find()).map(dumpUser);
  return { status: 'SUCCESS', data: { users }, statusCode: 200 };
};
