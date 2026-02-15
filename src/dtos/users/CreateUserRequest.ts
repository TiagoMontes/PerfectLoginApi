import { z } from 'zod';
import { emailSchema, passwordSchema, nameSchema, phoneSchema, addressSchema } from '../../utils/validators';
import { Role } from '../../entities/Role';

export const CreateUserRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  phone: phoneSchema,
  address: addressSchema,
  role: z.nativeEnum(Role).optional().default(Role.CLIENT)
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
