import { AuthService } from '../services/AuthService';
import { UnauthorizedError } from '../utils/errors';
import { JwtPayload } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function createAuthenticateMiddleware(authService: AuthService) {
  return async function authenticate(req: AuthenticatedRequest): Promise<JwtPayload> {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    if (!token) {
      throw new UnauthorizedError('Token not provided');
    }

    const payload = await authService.validateToken(token);
    return payload;
  };
}
