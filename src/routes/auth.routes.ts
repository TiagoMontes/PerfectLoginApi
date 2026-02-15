import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { InMemoryUserRepository } from '../repositories/UserRepository';
import { InMemorySessionRepository } from '../repositories/SessionRepository';
import { HashService } from '../services/HashService';

const userRepo = new InMemoryUserRepository();
const sessionRepo = new InMemorySessionRepository();
const hashService = new HashService();
const authService = new AuthService(userRepo, sessionRepo, hashService);
const authController = new AuthController(authService);

export const authRoutes = {
  '/auth/login': {
    POST: (req: Request) => authController.login(req)
  },
  '/auth/logout': {
    POST: (req: Request) => authController.logout(req)
  }
};

export { userRepo, sessionRepo, hashService, authService };
