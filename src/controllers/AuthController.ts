import { AuthService } from '../services/AuthService';
import { LoginRequestSchema } from '../dtos/auth/LoginRequest';
import type { LogoutResponse } from '../dtos/auth/LogoutResponse';
import { ValidationError } from '../utils/errors';
import { success } from '../utils/response';
import { ZodError } from 'zod';
import type { FastifyRequest } from 'fastify';

export class AuthController {
  constructor(private authService: AuthService) {}

  async login(req: FastifyRequest): Promise<Response> {
    try {
      const body = await req.body;
      const validated = LoginRequestSchema.parse(body);

      const result = await this.authService.login(validated);

      return Response.json(result, { status: 200 });
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

  async logout(req: FastifyRequest): Promise<Response> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: 'UnauthorizedError', message: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    await this.authService.logout(token);

    const result: LogoutResponse = {
      message: 'Logout successful'
    };

    return Response.json(result, { status: 200 });
  }
}
