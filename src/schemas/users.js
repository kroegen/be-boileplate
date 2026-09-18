import { z } from 'zod';

export const userCreateSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z
    .string()
    .email({ message: 'Invalid email format' })
    .min(1, { message: 'Email is required' }),
  password: z.string().min(1, { message: 'Password is required' }).optional(),
});
