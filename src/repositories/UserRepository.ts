import { User } from '../entities/User';
import { UserStatus } from '../entities/UserStatus';
import { IUserRepository } from './IUserRepository';
import { NotFoundError } from '../utils/errors';

export class InMemoryUserRepository implements IUserRepository {
  private users = new Map<string, User>();
  private emailIndex = new Map<string, string>();

  async create(user: User): Promise<User> {
    this.users.set(user.id, user);
    this.emailIndex.set(user.email.toLowerCase(), user.id);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const id = this.emailIndex.get(email.toLowerCase());
    return id ? this.users.get(id) || null : null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      user => user.status !== UserStatus.DELETED
    );
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (data.email && data.email !== user.email) {
      this.emailIndex.delete(user.email.toLowerCase());
      this.emailIndex.set(data.email.toLowerCase(), id);
    }

    const updatedUser = {
      ...user,
      ...data,
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: new Date()
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await this.update(id, { status: UserStatus.DELETED });
  }
}
