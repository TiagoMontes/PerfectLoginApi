# Developer Quickstart Guide

**Feature**: User Authentication & Management API
**Date**: 2026-02-14

## Overview

This guide helps you get the authentication API up and running locally for development and testing.

## Prerequisites

- **Bun** runtime (latest stable version)
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```
- **Git** for version control
- **Text editor** (VS Code recommended)

## Initial Setup

### 1. Install Dependencies

```bash
bun install
```

This will install:
- `jsonwebtoken` - JWT token generation/validation
- `zod` - Input validation schemas
- `@types/jsonwebtoken` - TypeScript types for JWT

### 2. Configure Environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Server
PORT=3000
NODE_ENV=development

# Security - CHANGE THIS IN PRODUCTION
JWT_SECRET=your-super-secret-jwt-key-change-me-in-production
JWT_EXPIRES_IN=1h

# Bun Runtime
BUN_ENV=development
```

**⚠️ IMPORTANT**: Never commit the `.env` file to version control!

### 3. Start Development Server

```bash
bun --hot src/index.ts
```

The API will be available at `http://localhost:3000`

Hot reload is enabled - changes to TypeScript files will automatically restart the server.

## Project Structure

```
loginApi/
├── src/
│   ├── entities/          # Data models (User, Session, Role)
│   ├── dtos/              # Request/response type definitions
│   ├── services/          # Business logic layer
│   ├── controllers/       # HTTP request handlers
│   ├── routes/            # Endpoint definitions
│   ├── middleware/        # Auth, RBAC, error handling
│   ├── repositories/      # Data access layer (in-memory)
│   ├── utils/             # Helper functions, validators
│   └── index.ts           # Application entry point
├── tests/
│   ├── unit/              # Unit tests (services, utils)
│   ├── integration/       # API endpoint tests
│   └── fixtures/          # Test data
├── specs/                 # Feature specifications
├── .env                   # Environment variables (not committed)
├── .env.example           # Environment template
└── package.json
```

## API Endpoints

### Base URL
```
http://localhost:3000
```

### Authentication

**Login**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

Response:
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+1234567890",
      "address": "123 Main St",
      "role": "CLIENT",
      "status": "ACTIVE",
      "createdAt": "2026-02-14T10:00:00.000Z",
      "updatedAt": "2026-02-14T10:00:00.000Z"
    }
  },
  "message": "Login successful"
}
```

**Logout**
```http
POST /auth/logout
Authorization: Bearer <your-token>
```

### User Management

**Create User (Sign Up)**
```http
POST /users
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "name": "Jane Doe",
  "phone": "+1234567890",
  "address": "456 Oak Avenue"
}
```

**List All Users** (ADMIN/OPERATOR only)
```http
GET /users
Authorization: Bearer <your-token>
```

**Get User by ID** (ADMIN/OPERATOR only)
```http
GET /users/{id}
Authorization: Bearer <your-token>
```

**Update User** (ADMIN only)
```http
PUT /users/{id}
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "role": "OPERATOR"
}
```

**Delete User** (ADMIN only)
```http
DELETE /users/{id}
Authorization: Bearer <your-token>
```

### Profile Management

**Get Own Profile** (All authenticated users)
```http
GET /profile
Authorization: Bearer <your-token>
```

**Update Own Profile** (All authenticated users)
```http
PUT /profile
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "name": "New Name",
  "phone": "+9876543210"
}
```

## Authentication Flow

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "name": "Test User",
    "phone": "+1234567890",
    "address": "123 Test St"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

Save the `token` from the response.

### 3. Access Protected Resources

```bash
# Get your profile
curl http://localhost:3000/profile \
  -H "Authorization: Bearer <your-token>"

# Update your profile
curl -X PUT http://localhost:3000/profile \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name"
  }'
```

### 4. Logout

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer <your-token>"
```

## Role-Based Access Control

### Permission Levels

**CLIENT** (Default for new users):
- ✅ Login/logout
- ✅ View own profile
- ✅ Update own profile
- ❌ View other users
- ❌ Create/update/delete other users

**OPERATOR**:
- ✅ All CLIENT permissions
- ✅ List all users
- ✅ View any user profile
- ❌ Create/update/delete users
- ❌ Change roles

**ADMIN**:
- ✅ All permissions
- ✅ Create users with any role
- ✅ Update any user (including role changes)
- ✅ Delete users

### Testing Different Roles

Create users with different roles (requires ADMIN privileges):

```bash
# Create an OPERATOR user (requires ADMIN token)
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "operator@example.com",
    "password": "OpPass123",
    "name": "Operator User",
    "phone": "+1234567890",
    "address": "456 Operator St",
    "role": "OPERATOR"
  }'
```

## Running Tests

### Run All Tests

```bash
bun test
```

### Run Specific Test File

```bash
bun test tests/unit/services/AuthService.test.ts
```

### Run Tests in Watch Mode

```bash
bun test --watch
```

### Test Coverage

```bash
bun test --coverage
```

## TDD Workflow

Follow the Red-Green-Refactor cycle:

### 1. RED - Write Failing Test

```typescript
// tests/unit/services/AuthService.test.ts
import { describe, it, expect } from 'bun:test';
import { AuthService } from '../../../src/services/AuthService';

describe('AuthService.login', () => {
  it('should return token for valid credentials', async () => {
    const authService = new AuthService();
    const result = await authService.login({
      email: 'test@example.com',
      password: 'TestPass123'
    });

    expect(result.token).toBeDefined();
  });
});
```

### 2. GREEN - Make Test Pass

```typescript
// src/services/AuthService.ts
async login(credentials: LoginRequest): Promise<LoginResponse> {
  // Minimal implementation to pass test
  return { token: 'fake-token', user: {} as User };
}
```

### 3. REFACTOR - Implement Fully

```typescript
// src/services/AuthService.ts
async login(credentials: LoginRequest): Promise<LoginResponse> {
  const user = await this.userRepo.findByEmail(credentials.email);
  if (!user) throw new UnauthorizedError('Invalid credentials');

  const isValid = await Bun.password.verify(credentials.password, user.password);
  if (!isValid) throw new UnauthorizedError('Invalid credentials');

  if (user.status !== 'ACTIVE') throw new ForbiddenError('Account not active');

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '1h'
  });

  await this.sessionRepo.create({
    token,
    userId: user.id,
    expiresAt: new Date(Date.now() + 3600000),
    createdAt: new Date()
  });

  return { token, user: toUserResponse(user) };
}
```

## Validation Rules

### Email
- ✅ Valid email format (RFC 5322)
- ✅ Maximum 255 characters
- ✅ Case-insensitive (stored lowercase)
- ✅ Must be unique

### Password
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)

Examples:
- ✅ `Password123`
- ✅ `SecureP@ss1`
- ❌ `password` (no uppercase, no number)
- ❌ `PASS123` (no lowercase)
- ❌ `Pass` (too short)

### Phone
- ✅ E.164 format recommended: `+[country code][number]`
- ✅ Pattern: `^\+?[1-9]\d{1,14}$`

Examples:
- ✅ `+1234567890`
- ✅ `+442071234567`
- ❌ `123-456-7890` (contains dashes)

## Common Development Tasks

### Create Initial Admin User

```bash
# Option 1: Via API (no authentication required for first user)
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123",
    "name": "System Admin",
    "phone": "+1234567890",
    "address": "Admin HQ",
    "role": "CLIENT"
  }'

# Then manually update role to ADMIN in code (or create with ADMIN role from another ADMIN)
```

### Reset In-Memory Data

Restart the server - all data is lost (in-memory storage):

```bash
# Stop server (Ctrl+C)
# Restart
bun --hot src/index.ts
```

### Check Server Health

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-14T10:00:00.000Z"
}
```

## Error Handling

### Success Response Format

```json
{
  "data": { /* resource or array */ },
  "message": "Operation completed successfully"
}
```

### Error Response Format

```json
{
  "error": "ErrorType",
  "message": "Human-readable error message",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common HTTP Status Codes

- **200 OK**: Successful GET, PUT
- **201 Created**: Successful POST (user created)
- **400 Bad Request**: Validation errors
- **401 Unauthorized**: Missing/invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Duplicate email
- **500 Internal Server Error**: Unexpected failure

## Debugging

### Enable Debug Logging

```typescript
// src/index.ts
if (process.env.NODE_ENV === 'development') {
  console.log('Server started on port', process.env.PORT);
  console.log('Environment:', process.env.NODE_ENV);
}
```

### Inspect JWT Token

Use [jwt.io](https://jwt.io) to decode tokens (paste token, view payload)

### Check Session Store

Add debugging endpoint (development only):

```typescript
// src/routes/debug.routes.ts (REMOVE IN PRODUCTION)
'/debug/sessions': {
  GET: async () => {
    const sessions = await sessionRepo.findAll();
    return Response.json({ data: sessions });
  }
}
```

## API Contract Validation

OpenAPI specifications are available in `specs/001-user-auth-api/contracts/`:

- `auth.openapi.yaml` - Login/logout endpoints
- `users.openapi.yaml` - User CRUD operations
- `profile.openapi.yaml` - Profile management

Use tools like Swagger UI or Postman to import and test against these contracts.

## Next Steps

1. **Implement Core Entities** - Start with `src/entities/`
2. **Create Repositories** - In-memory storage in `src/repositories/`
3. **Build Services** - Business logic in `src/services/`
4. **Add Controllers** - HTTP handlers in `src/controllers/`
5. **Define Routes** - Endpoint mappings in `src/routes/`
6. **Write Tests** - Follow TDD workflow

For detailed implementation tasks, see `tasks.md` (generated by `/speckit.tasks` command).

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### JWT Secret Not Set

```
Error: JWT_SECRET is not defined
```

Solution: Add `JWT_SECRET` to your `.env` file

### Bun Not Found

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Reload shell
source ~/.bashrc  # or ~/.zshrc
```

## Security Reminders

- ⚠️ Never commit `.env` file
- ⚠️ Change `JWT_SECRET` in production
- ⚠️ Use HTTPS in production
- ⚠️ Rotate JWT secrets periodically
- ⚠️ Implement rate limiting before production (currently out of scope)

## Additional Resources

- [Bun Documentation](https://bun.sh/docs)
- [Bun.serve API](https://bun.sh/docs/api/http)
- [Zod Documentation](https://zod.dev)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [RESTful API Guidelines](https://restfulapi.net)
