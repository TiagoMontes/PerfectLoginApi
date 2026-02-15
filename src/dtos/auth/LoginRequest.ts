import { z } from 'zod';
import { emailSchema, passwordSchema } from '../../utils/validators';

export const LoginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
