import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { userRepo, hashService } from './auth.routes';

const userService = new UserService(userRepo, hashService);
const userController = new UserController(userService);

export const userRoutes = {
  '/users': {
    POST: (req: Request) => userController.create(req)
  }
};

export { userService };
