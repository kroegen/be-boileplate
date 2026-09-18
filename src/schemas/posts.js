import { z } from 'zod';

export const postCreateSchema = z.object({
  author: z.string().min(1, { message: 'Author is required' }),
  content: z.string().min(1, { message: 'Content is required' }),
});
