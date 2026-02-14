# Phase 0: Research & Technology Decisions

**Feature**: User Authentication & Management API
**Date**: 2026-02-14
**Status**: Complete

## Overview

This document captures technology selections, architectural patterns, and best practices research for implementing a secure authentication API using Bun runtime with TypeScript.

## Technology Stack Decisions

### 1. JWT Token Management

**Decision**: Use `jsonwebtoken` npm package

**Rationale**:
- Industry-standard library with 20M+ weekly downloads
- Well-tested and widely adopted
- Provides sign/verify with multiple algorithms (HS256, RS256)
- Good TypeScript support with @types/jsonwebtoken
- Bun has no built-in JWT library yet

**Alternatives Considered**:
- `jose`: Modern, smaller bundle, but less ecosystem support
- Manual implementation: Violates "don't roll your own crypto" security principle
- `jsonwebtokens-bun`: Bun-specific fork, but unmaintained

**Implementation Pattern**:
```typescript
import jwt from 'jsonwebtoken';

const token = jwt.sign({ userId, role }, process.env.JWT_SECRET!, {
  expiresIn: '1h'
});

const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
```

### 2. Password Hashing

**Decision**: Use Bun.password.hash (built-in bcrypt)

**Rationale**:
- Built directly into Bun runtime - no external dependency
- Uses bcrypt algorithm (industry standard)
- Simple API: `await Bun.password.hash(plaintext, { algorithm: "bcrypt" })`
- Automatically handles salting
- Better performance than Node.js bcrypt package

**Alternatives Considered**:
- `bcrypt` npm package: Unnecessary when Bun provides it natively
- `argon2`: More secure but requires native compilation, adds complexity
- Manual hashing: Security anti-pattern

**Implementation Pattern**:
```typescript
const hashedPassword = await Bun.password.hash(plainPassword, {
  algorithm: "bcrypt",
  cost: 10
});

const isValid = await Bun.password.verify(plainPassword, hashedPassword);
```

### 3. Input Validation

**Decision**: Zod schemas for all DTOs

**Rationale**:
- Type-safe validation with automatic TypeScript inference
- Composable schemas (reuse email/password validators)
- Rich error messages for API responses
- Zero-dependency schema definition
- Excellent developer experience

**Alternatives Considered**:
- `joi`: Older, more verbose, weaker TypeScript support
- `yup`: Good but Zod has better type inference
- Manual validation: Error-prone, verbose, no type safety

**Implementation Pattern**:
```typescript
import { z } from 'zod';

const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type LoginRequest = z.infer<typeof LoginRequestSchema>;

// In controller
const validated = LoginRequestSchema.parse(req.body);
```

### 4. Testing Framework

**Decision**: bun test (built-in)

**Rationale**:
- Native to Bun runtime - no setup required
- Fast execution (4x faster than Jest)
- Compatible test API (describe, it, expect)
- No configuration needed
- Supports TypeScript out of the box

**Alternatives Considered**:
- Jest: Slower, requires configuration for ESM/TypeScript
- Vitest: Good but unnecessary when Bun has native testing
- Mocha/Chai: Older, more setup required

**Implementation Pattern**:
```typescript
import { describe, it, expect } from 'bun:test';

describe('AuthService', () => {
  it('should validate correct credentials', async () => {
    const result = await authService.login(validCredentials);
    expect(result.token).toBeDefined();
  });
});
```

### 5. HTTP Server

**Decision**: Bun.serve() with route object

**Rationale**:
- Built into Bun - no Express needed
- Built-in WebSocket support (for future real-time features)
- Faster than Express (6x throughput)
- Native request/response objects
- Hot reload in development mode

**Alternatives Considered**:
- Express: Slower, unnecessary abstraction layer
- Fastify: Better than Express but still slower than Bun.serve
- Elysia: Bun-specific framework adds complexity

**Implementation Pattern**:
```typescript
Bun.serve({
  port: 3000,
  routes: {
    '/auth/login': {
      POST: loginController.handle
    },
    '/users/:id': {
      GET: userController.getById,
      PUT: userController.update,
      DELETE: userController.delete
    }
  },
  development: {
    hmr: true
  }
});
```

## Architectural Patterns

### 1. Repository Pattern for Data Access

**Decision**: Implement Repository layer despite in-memory storage

**Rationale**:
- User explicitly requested this pattern
- Abstracts storage implementation
- Enables database swap without touching services
- Testable through mocking
- Follows SOLID principles (Dependency Inversion)

**Pattern**:
```typescript
interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(): Promise<User[]>;
}

class InMemoryUserRepository implements IUserRepository {
  private users = new Map<string, User>();
  // ... implementation
}
```

### 2. Middleware-Based Authentication/Authorization

**Decision**: Separate middleware for auth (authentication) and RBAC (authorization)

**Rationale**:
- Single Responsibility: auth verifies token, RBAC checks permissions
- Composable: Different endpoints need different role requirements
- Reusable: Apply to any route
- Testable: Mock JWT verification independently

**Pattern**:
```typescript
// authenticate.ts - validates JWT
export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = jwt.verify(token, JWT_SECRET);
  req.user = payload;
  next();
};

// authorize.ts - checks role
export const authorize = (...roles: Role[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Usage in routes
'/users': {
  GET: [authenticate, authorize('ADMIN', 'OPERATOR'), userController.list]
}
```

### 3. Service Layer for Business Logic

**Decision**: All business logic in services, controllers stay thin

**Rationale**:
- Follows MVC/Layered Architecture constitution principle
- Controllers only handle HTTP I/O and validation
- Services are protocol-agnostic (could be used from CLI/GraphQL/etc)
- Easier to test business logic without HTTP concerns

**Pattern**:
```typescript
// Controller: thin, HTTP-focused
class UserController {
  async create(req: Request): Promise<Response> {
    const validated = CreateUserSchema.parse(req.body);
    const user = await userService.createUser(validated);
    return Response.json({ data: user, message: 'User created' }, { status: 201 });
  }
}

// Service: thick, business logic
class UserService {
  async createUser(data: CreateUserDto): Promise<User> {
    // Check duplicate email
    const existing = await userRepo.findByEmail(data.email);
    if (existing) throw new ConflictError('Email already in use');

    // Hash password
    const hashedPassword = await hashService.hash(data.password);

    // Assign default role
    const user = { ...data, password: hashedPassword, role: Role.CLIENT };

    return await userRepo.create(user);
  }
}
```

### 4. DTO Pattern with Zod Schemas

**Decision**: Separate request/response DTOs with Zod validation

**Rationale**:
- Type safety at runtime and compile time
- Clear API contract documentation
- Prevents over-posting attacks (only validated fields accepted)
- Automatic TypeScript types from schemas

**Pattern**:
```typescript
// CreateUserRequest.ts
export const CreateUserRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
  name: z.string().min(1),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  address: z.string().min(1)
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;

// UserResponse.ts - excludes password
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
```

## Security Best Practices

### 1. Password Validation Rules

**Requirements** (from spec clarifications):
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Zod Schema**:
```typescript
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');
```

### 2. JWT Token Security

**Best Practices**:
- Store JWT_SECRET in .env file (never commit)
- Use HS256 algorithm (symmetric) for simplicity
- Set 1-hour expiration (per spec)
- Include minimal payload: userId, role
- Validate on every protected route
- No refresh tokens in MVP (out of scope)

**Token Payload**:
```typescript
interface JwtPayload {
  userId: string;
  role: Role;
  iat: number;  // issued at
  exp: number;  // expires at
}
```

### 3. Error Response Sanitization

**Principle**: Never expose internal details in error responses

**Pattern**:
```typescript
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public userMessage: string,
    public internalMessage?: string
  ) {
    super(internalMessage || userMessage);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.userMessage  // Safe for users
    });
  }

  // Unknown errors: log details, send generic message
  console.error(err);
  return res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred'
  });
};
```

### 4. Session Management

**Strategy**:
- Stateful sessions stored in-memory (SessionRepository)
- Each session has: token, userId, expiresAt
- Logout deletes session from store
- Expired sessions automatically rejected during validation
- No session extension/refresh in MVP

**Pattern**:
```typescript
class SessionRepository {
  private sessions = new Map<string, Session>();

  async create(session: Session): Promise<void> {
    this.sessions.set(session.token, session);
  }

  async findByToken(token: string): Promise<Session | null> {
    const session = this.sessions.get(token);
    if (!session) return null;

    // Auto-expire check
    if (new Date() > session.expiresAt) {
      this.sessions.delete(token);
      return null;
    }

    return session;
  }

  async deleteByToken(token: string): Promise<void> {
    this.sessions.delete(token);
  }
}
```

## API Design Patterns

### 1. Consistent Response Structure

**Success Response**:
```json
{
  "data": { /* resource or array */ },
  "message": "Operation completed successfully"
}
```

**Error Response**:
```json
{
  "error": "ValidationError",
  "message": "Invalid input provided",
  "details": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

### 2. RESTful Endpoint Design

**Resource-Oriented URLs**:
- POST /auth/login - Create session
- POST /auth/logout - Delete session
- POST /users - Create user (registration)
- GET /users - List all users
- GET /users/:id - Get specific user
- PUT /users/:id - Update user
- DELETE /users/:id - Delete user
- GET /profile - Get authenticated user's profile
- PUT /profile - Update authenticated user's profile

**HTTP Status Code Usage**:
- 200 OK: Successful GET, PUT
- 201 Created: Successful POST
- 204 No Content: Successful DELETE
- 400 Bad Request: Validation errors
- 401 Unauthorized: Missing/invalid auth token
- 403 Forbidden: Valid auth but insufficient permissions
- 404 Not Found: Resource doesn't exist
- 409 Conflict: Duplicate email
- 500 Internal Server Error: Unexpected failures

### 3. Role-Based Access Control Matrix

| Endpoint | ADMIN | OPERATOR | CLIENT |
|----------|-------|----------|---------|
| POST /auth/login | ✅ | ✅ | ✅ |
| POST /auth/logout | ✅ | ✅ | ✅ |
| POST /users | ✅ | ❌ | ❌ |
| GET /users | ✅ | ✅ | ❌ |
| GET /users/:id | ✅ | ✅ | ❌ (own only) |
| PUT /users/:id | ✅ | ❌ | ❌ |
| DELETE /users/:id | ✅ | ❌ | ❌ |
| GET /profile | ✅ | ✅ | ✅ |
| PUT /profile | ✅ | ✅ | ✅ |

## Testing Strategy

### 1. Test Pyramid

**Unit Tests** (70%):
- Services: Business logic, RBAC rules
- Utilities: JWT helpers, validators
- Repositories: CRUD operations

**Integration Tests** (25%):
- API endpoints: Full request/response cycle
- Middleware: Auth/authz chains
- Error handling: Various failure scenarios

**E2E Tests** (5%):
- Complete user journeys
- Multi-step workflows (register → login → access resource)

### 2. Test Data Fixtures

**Sample Test Users**:
```typescript
export const testUsers = {
  admin: {
    email: 'admin@example.com',
    password: 'Admin123',
    name: 'Admin User',
    role: Role.ADMIN
  },
  operator: {
    email: 'operator@example.com',
    password: 'Operator123',
    name: 'Operator User',
    role: Role.OPERATOR
  },
  client: {
    email: 'client@example.com',
    password: 'Client123',
    name: 'Client User',
    role: Role.CLIENT
  }
};
```

### 3. TDD Workflow

1. **Red**: Write failing test
2. **Green**: Write minimal code to pass
3. **Refactor**: Clean up while keeping tests green

**Example TDD Cycle**:
```typescript
// 1. RED - Write failing test
describe('AuthService.login', () => {
  it('should return token for valid credentials', async () => {
    const result = await authService.login({
      email: 'user@example.com',
      password: 'Password123'
    });
    expect(result.token).toBeDefined();
  });
});

// 2. GREEN - Minimal implementation
async login(credentials: LoginRequest) {
  return { token: 'fake-token' }; // Just make it pass
}

// 3. REFACTOR - Real implementation
async login(credentials: LoginRequest) {
  const user = await userRepo.findByEmail(credentials.email);
  if (!user) throw new UnauthorizedError('Invalid credentials');

  const isValid = await Bun.password.verify(credentials.password, user.password);
  if (!isValid) throw new UnauthorizedError('Invalid credentials');

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '1h'
  });

  await sessionRepo.create({ token, userId: user.id, expiresAt: new Date(Date.now() + 3600000) });

  return { token };
}
```

## Environment Configuration

### .env Structure

```bash
# Server
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=1h

# Bun Runtime
BUN_ENV=development
```

### .env.example Template

```bash
PORT=3000
NODE_ENV=development
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=1h
```

## Performance Considerations

### 1. In-Memory Storage Optimization

**Use Map instead of Array**:
- O(1) lookup by ID vs O(n) with Array.find()
- Critical for 10k user requirement

**Pattern**:
```typescript
class InMemoryUserRepository {
  private users = new Map<string, User>();  // ✅ Fast
  // NOT: private users: User[] = [];        // ❌ Slow

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;  // O(1)
  }
}
```

### 2. Password Hashing Cost

**bcrypt cost factor**: 10 (default)
- Higher = more secure but slower
- Cost 10 ≈ 100ms per hash
- Acceptable for authentication (not called frequently)

### 3. Session Cleanup

**Expired session removal**:
- Passive: Remove during lookup (implemented)
- Active: Background job (future optimization, out of scope)

## Future Database Migration Path

### When moving from in-memory to database:

**What changes**:
- Repository implementations (UserRepository, SessionRepository)
- Add database connection/ORM setup
- Add migration files

**What doesn't change**:
- Services (business logic)
- Controllers (HTTP handling)
- DTOs/Entities (type definitions)
- Routes (endpoint definitions)
- Middleware (auth/authz logic)

**Migration Example**:
```typescript
// Before: InMemoryUserRepository
class InMemoryUserRepository implements IUserRepository {
  private users = new Map<string, User>();
  async findById(id: string) { return this.users.get(id); }
}

// After: SqliteUserRepository
class SqliteUserRepository implements IUserRepository {
  constructor(private db: Database) {}
  async findById(id: string) {
    return this.db.query('SELECT * FROM users WHERE id = ?').get(id);
  }
}

// Services unchanged - they depend on IUserRepository interface
```

## Open Questions Resolved

All technical unknowns from plan.md Technical Context section have been resolved:

✅ **JWT Library**: jsonwebtoken
✅ **Password Hashing**: Bun.password.hash
✅ **Validation**: Zod schemas
✅ **Testing**: bun test
✅ **HTTP Server**: Bun.serve
✅ **Error Handling**: Custom error classes + middleware
✅ **Session Management**: In-memory with automatic expiration
✅ **RBAC Implementation**: Middleware-based authorization

## References

- [Bun.serve() documentation](https://bun.sh/docs/api/http)
- [Bun.password API](https://bun.sh/docs/api/hashing#bun-password)
- [Zod documentation](https://zod.dev)
- [jsonwebtoken npm](https://www.npmjs.com/package/jsonwebtoken)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [RESTful API Best Practices](https://restfulapi.net)
