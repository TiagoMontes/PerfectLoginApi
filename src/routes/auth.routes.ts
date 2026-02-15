import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
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

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const response = await authController.login(request);
    const data = await response.json();

    return reply.status(response.status).send(data);
  });

  fastify.post('/auth/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    const response = await authController.logout(request);
    const data = await response.json();

    return reply.status(response.status).send(data);
  });
};

export { userRepo, sessionRepo, hashService, authService };
