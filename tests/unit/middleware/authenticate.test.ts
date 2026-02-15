import { describe, it, expect, beforeEach } from 'bun:test';
import { createAuthenticateMiddleware, AuthenticatedRequest } from '../../../src/middleware/authenticate';
import { AuthService } from '../../../src/services/AuthService';
import { InMemoryUserRepository } from '../../../src/repositories/UserRepository';
import { InMemorySessionRepository } from '../../../src/repositories/SessionRepository';
import { HashService } from '../../../src/services/HashService';
import { UnauthorizedError } from '../../../src/utils/errors';
import { sign } from '../../../src/utils/jwt';
import { Role } from '../../../src/entities/Role';

describe('authenticate middleware', () => {
  let authService: AuthService;
  let authenticate: (req: AuthenticatedRequest) => Promise<any>;
  let userRepo: InMemoryUserRepository;
  let sessionRepo: InMemorySessionRepository;
  const JWT_SECRET = 'test-secret';

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    sessionRepo = new InMemorySessionRepository();
    const hashService = new HashService();
    authService = new AuthService(userRepo, sessionRepo, hashService);
    authenticate = createAuthenticateMiddleware(authService);

    process.env.JWT_SECRET = JWT_SECRET;
  });

  it('should throw UnauthorizedError when Authorization header is missing', async () => {
    const req = new Request('http://localhost/test', {
      headers: {}
    }) as AuthenticatedRequest;

    expect(authenticate(req)).rejects.toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError when Authorization header does not start with Bearer', async () => {
    const req = new Request('http://localhost/test', {
      headers: {
        'Authorization': 'Basic sometoken'
      }
    }) as AuthenticatedRequest;

    expect(authenticate(req)).rejects.toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError when token is empty', async () => {
    const req = new Request('http://localhost/test', {
      headers: {
        'Authorization': 'Bearer '
      }
    }) as AuthenticatedRequest;

    expect(authenticate(req)).rejects.toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError when token is invalid', async () => {
    const req = new Request('http://localhost/test', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    }) as AuthenticatedRequest;

    expect(authenticate(req)).rejects.toThrow(UnauthorizedError);
  });

  it('should return payload when token is valid and session exists', async () => {
    const userId = 'test-user-id';
    const role = Role.CLIENT;
    const token = sign({ userId, role }, JWT_SECRET, '1h');

    await sessionRepo.create({
      token,
      userId,
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date()
    });

    await userRepo.create({
      id: userId,
      email: 'test@example.com',
      password: 'hashed',
      name: 'Test User',
      phone: '+1234567890',
      address: 'Test Address',
      role,
      status: 'ACTIVE' as any,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const req = new Request('http://localhost/test', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }) as AuthenticatedRequest;

    const payload = await authenticate(req);
    expect(payload.userId).toBe(userId);
    expect(payload.role).toBe(role);
  });
});
