import User from '#src/models/User.js';
import { dumpUser } from '#src/utils/dump.js';

export const getUsers = async () => {
  const users = (await User.find()).map((user) => dumpUser(user));
  return { status: 'SUCCESS', data: { users }, statusCode: 200 };
};
