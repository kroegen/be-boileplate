import { createSession } from '#src/services/sessions/index.js';

export const create = async (req, res) => {
  const result = await createSession(req.body);
  res.status(result.statusCode).json({
    status: result.status === 'SUCCESS' ? 1 : 0,
    data: result.data,
  });
};
