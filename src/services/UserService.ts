import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { UserStatus } from '../entities/UserStatus';
import { CreateUserRequest } from '../dtos/users/CreateUserRequest';
import { toUserResponse, UserResponse } from '../dtos/users/UserResponse';
import { IUserRepository } from '../repositories/IUserRepository';
import { HashService } from './HashService';
import { ConflictError } from '../utils/errors';

export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private hashService: HashService
  ) {}

  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('Email already in use');
    }

    const hashedPassword = await this.hashService.hash(data.password);

    const user: User = {
      id: crypto.randomUUID(),
      email: data.email.toLowerCase(),
      password: hashedPassword,
      name: data.name,
      phone: data.phone,
      address: data.address,
      role: data.role || Role.CLIENT,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const createdUser = await this.userRepository.create(user);
    return toUserResponse(createdUser);
  }
}
