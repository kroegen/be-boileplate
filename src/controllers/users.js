import { createUser, getUsers } from '#src/services/users/index.js';

export const create = async (req, res) => {
  const result = await createUser(req.body);
  res.status(result.statusCode).json({
    status: result.status === 'SUCCESS' ? 1 : 0,
    data: result.data,
  });
};

export const list = async (req, res) => {
  const result = await getUsers();
  res.status(result.statusCode).json({
    status: result.status === 'SUCCESS' ? 1 : 0,
    data: result.data,
  });
};
