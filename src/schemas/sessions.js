import { z } from 'zod';

export const sessionCreateSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }).min(1, { message: 'Email is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});
