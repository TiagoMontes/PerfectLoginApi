import { User } from '../../src/entities/User';
import { Role } from '../../src/entities/Role';
import { UserStatus } from '../../src/entities/UserStatus';

export const testUsers = {
  admin: {
    id: 'test-admin-id-1',
    email: 'admin@example.com',
    password: 'Admin123',
    name: 'Admin User',
    phone: '+1234567890',
    address: 'Admin HQ',
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z')
  } as User,
  operator: {
    id: 'test-operator-id-1',
    email: 'operator@example.com',
    password: 'Operator123',
    name: 'Operator User',
    phone: '+1234567891',
    address: 'Operator Office',
    role: Role.OPERATOR,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z')
  } as User,
  client: {
    id: 'test-client-id-1',
    email: 'client@example.com',
    password: 'Client123',
    name: 'Client User',
    phone: '+1234567892',
    address: '123 Client St',
    role: Role.CLIENT,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z')
  } as User
};

export const hashedPasswords = {
  'Admin123': '$2b$10$placeholder.hash.for.Admin123',
  'Operator123': '$2b$10$placeholder.hash.for.Operator123',
  'Client123': '$2b$10$placeholder.hash.for.Client123',
  'TestPass123': '$2b$10$placeholder.hash.for.TestPass123'
};
