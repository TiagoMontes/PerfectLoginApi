import { LoginRequest } from '../dtos/auth/LoginRequest';
import { LoginResponse } from '../dtos/auth/LoginResponse';
import { toUserResponse } from '../dtos/users/UserResponse';
import { IUserRepository } from '../repositories/IUserRepository';
import { ISessionRepository } from '../repositories/ISessionRepository';
import { HashService } from './HashService';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { sign, verify, JwtPayload } from '../utils/jwt';
import { loadEnv } from '../utils/env';
import { UserStatus } from '../entities/UserStatus';

export class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private sessionRepository: ISessionRepository,
    private hashService: HashService
  ) {}

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await this.hashService.verify(credentials.password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenError('Account is not active');
    }

    const env = loadEnv();
    const token = sign(
      { userId: user.id, role: user.role },
      env.JWT_SECRET,
      env.JWT_EXPIRES_IN
    );

    const expiresAt = new Date(Date.now() + 3600000);
    await this.sessionRepository.create({
      token,
      userId: user.id,
      expiresAt,
      createdAt: new Date()
    });

    return {
      data: {
        token,
        user: toUserResponse(user)
      },
      message: 'Login successful'
    };
  }

  async logout(token: string): Promise<void> {
    await this.sessionRepository.deleteByToken(token);
  }

  async validateToken(token: string): Promise<JwtPayload> {
    const env = loadEnv();

    try {
      const payload = verify(token, env.JWT_SECRET);

      const session = await this.sessionRepository.findByToken(token);
      if (!session) {
        throw new UnauthorizedError('Invalid or expired session');
      }

      const user = await this.userRepository.findById(payload.userId);
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedError('User account is not active');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid token');
    }
  }
}
