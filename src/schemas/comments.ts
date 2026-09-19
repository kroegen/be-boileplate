import { z } from 'zod';

export const commentCreateSchema = z.object({
  author: z.string().min(1, { message: 'Author is required' }),
  content: z.string().min(1, { message: 'Content is required' }),
});

export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
