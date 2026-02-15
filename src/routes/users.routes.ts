import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { userRepo, hashService } from './auth.routes';

const userService = new UserService(userRepo, hashService);
const userController = new UserController(userService);

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/users', async (request: FastifyRequest, reply: FastifyReply) => {
    const response = await userController.create(request);
    const data = await response.json();

    return reply.status(response.status).send(data);
  });
};

export { userService };
