import { UserService } from '../services/UserService';
import { CreateUserRequestSchema } from '../dtos/users/CreateUserRequest';
import { ValidationError } from '../utils/errors';
import { success } from '../utils/response';
import { ZodError } from 'zod';
import type { FastifyRequest } from 'fastify';

export class UserController {
  constructor(private userService: UserService) {}

  async create(req: FastifyRequest): Promise<Response> {
    try {
      const body = await req.body;
      const validated = CreateUserRequestSchema.parse(body);

      const user = await this.userService.createUser(validated);

      return Response.json(
        success(user, 'User created successfully'),
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        throw new ValidationError(JSON.stringify(details));
      }
      throw error;
    }
  }
}
