# Phase 1: Data Model

**Feature**: User Authentication & Management API
**Date**: 2026-02-14
**Status**: Complete

## Overview

This document defines the core entities, their relationships, validation rules, and state transitions for the authentication system.

## Entity Definitions

### User Entity

Represents an individual with system access.

**TypeScript Interface**:
```typescript
interface User {
  id: string;              // UUID v4
  email: string;           // Unique identifier, lowercase
  password: string;        // Bcrypt hash, never exposed in responses
  name: string;            // Full name
  phone: string;           // Phone number with country code
  address: string;         // Physical address
  role: Role;              // Permission level (ADMIN, OPERATOR, CLIENT)
  status: UserStatus;      // Account state (ACTIVE, INACTIVE, DELETED)
  createdAt: Date;         // Account creation timestamp
  updatedAt: Date;         // Last modification timestamp
}
```

**Field Specifications**:

| Field | Type | Constraints | Validation |
|-------|------|-------------|------------|
| id | string | UUID v4, immutable | Auto-generated on creation |
| email | string | Unique, lowercase, max 255 chars | Valid email format (RFC 5322) |
| password | string | Bcrypt hash | Min 8 chars, 1 upper, 1 lower, 1 number (pre-hash) |
| name | string | Required, 1-100 chars | Non-empty string |
| phone | string | Required, valid format | E.164 format recommended |
| address | string | Required, 1-500 chars | Non-empty string |
| role | Role | Enum, required | One of: ADMIN, OPERATOR, CLIENT |
| status | UserStatus | Enum, default ACTIVE | One of: ACTIVE, INACTIVE, DELETED |
| createdAt | Date | Auto-set, immutable | ISO 8601 timestamp |
| updatedAt | Date | Auto-updated | ISO 8601 timestamp |

**Business Rules**:
- Email must be unique across all users
- Email is case-insensitive (stored lowercase)
- Password must never be returned in API responses
- Default role for new registrations is CLIENT
- Status defaults to ACTIVE on creation
- Deleted users have status DELETED but record persists
- Only ADMIN can create users with ADMIN or OPERATOR roles

**Zod Schema**:
```typescript
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().max(255).toLowerCase(),
  password: z.string(), // Hash, no validation on this field
  name: z.string().min(1).max(100),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/), // E.164 format
  address: z.string().min(1).max(500),
  role: z.enum(['ADMIN', 'OPERATOR', 'CLIENT']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DELETED']),
  createdAt: z.date(),
  updatedAt: z.date()
});
```

### Role Enum

Represents permission levels in the system.

**TypeScript Definition**:
```typescript
enum Role {
  ADMIN = 'ADMIN',       // Full permissions
  OPERATOR = 'OPERATOR', // Read-only + self-management
  CLIENT = 'CLIENT'      // Self-management only
}
```

**Permission Matrix**:

| Operation | ADMIN | OPERATOR | CLIENT |
|-----------|-------|----------|---------|
| Create user | ✅ | ❌ | ❌ |
| List all users | ✅ | ✅ | ❌ |
| View any user | ✅ | ✅ | ❌ |
| View own profile | ✅ | ✅ | ✅ |
| Update any user | ✅ | ❌ | ❌ |
| Update own profile | ✅ | ✅ | ✅ |
| Delete any user | ✅ | ❌ | ❌ |
| Change user role | ✅ | ❌ | ❌ |
| Change own role | ❌ | ❌ | ❌ |

**Hierarchy**:
```
ADMIN (highest privilege)
  ↓
OPERATOR (middle privilege)
  ↓
CLIENT (lowest privilege)
```

### UserStatus Enum

Represents the lifecycle state of a user account.

**TypeScript Definition**:
```typescript
enum UserStatus {
  ACTIVE = 'ACTIVE',      // Normal operational state
  INACTIVE = 'INACTIVE',  // Temporarily disabled
  DELETED = 'DELETED'     // Soft-deleted, cannot authenticate
}
```

**State Transitions**:
```
     ┌─────────┐
     │ ACTIVE  │ (default on creation)
     └────┬────┘
          │
   ┌──────┴──────┐
   │             │
   v             v
┌──────────┐  ┌─────────┐
│ INACTIVE │  │ DELETED │
└──────────┘  └─────────┘
   │             ^
   └─────────────┘
```

**Business Rules**:
- New users start in ACTIVE status
- INACTIVE users cannot authenticate but data persists
- DELETED users cannot authenticate and are hidden from listings
- DELETED status is irreversible (soft delete, record remains)
- Only ADMIN can change user status

### Session Entity

Represents an authenticated user's active connection.

**TypeScript Interface**:
```typescript
interface Session {
  token: string;      // JWT token string
  userId: string;     // Foreign key to User.id
  expiresAt: Date;    // Expiration timestamp (1 hour from creation)
  createdAt: Date;    // Session creation timestamp
}
```

**Field Specifications**:

| Field | Type | Constraints | Validation |
|-------|------|-------------|------------|
| token | string | Unique, JWT format | Valid JWT signature |
| userId | string | UUID, references User.id | Must exist in users |
| expiresAt | Date | Required, future timestamp | createdAt + 1 hour |
| createdAt | Date | Auto-set, immutable | ISO 8601 timestamp |

**Business Rules**:
- Token is the primary key (unique identifier)
- Session expires exactly 1 hour after creation
- Expired sessions are automatically rejected during validation
- Logout deletes session immediately
- One user can have multiple concurrent sessions (multi-device)
- Session deletion on one device doesn't affect other devices

**Lifecycle**:
```
Login → Create Session → Active (1 hour) → Expired → Auto-reject
                              ↓
                          Logout → Delete Session
```

## Entity Relationships

### Entity-Relationship Diagram

```
┌──────────────────┐         ┌──────────────────┐
│      User        │         │     Session      │
├──────────────────┤         ├──────────────────┤
│ id (PK)          │◄───────┤ userId (FK)      │
│ email (UNIQUE)   │   1:N  │ token (PK)       │
│ password         │         │ expiresAt        │
│ name             │         │ createdAt        │
│ phone            │         └──────────────────┘
│ address          │
│ role (FK)        │◄────┐
│ status           │     │
│ createdAt        │     │
│ updatedAt        │     │
└──────────────────┘     │
                         │
                    ┌────┴──────┐
                    │   Role    │
                    │  (ENUM)   │
                    ├───────────┤
                    │ ADMIN     │
                    │ OPERATOR  │
                    │ CLIENT    │
                    └───────────┘
```

### Relationships

**User ←→ Session** (One-to-Many):
- One User can have multiple Sessions (multi-device login)
- Each Session belongs to exactly one User
- Deleting a Session doesn't affect the User
- Deleting a User should invalidate all their Sessions

**User ←→ Role** (Many-to-One):
- Each User has exactly one Role
- Role is an enum, not a separate table
- Role determines User's permissions

## Validation Rules

### User Registration (Create)

**Required Fields**:
```typescript
const CreateUserSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .toLowerCase(),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),

  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long'),

  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),

  address: z.string()
    .min(1, 'Address is required')
    .max(500, 'Address too long'),

  role: z.enum(['ADMIN', 'OPERATOR', 'CLIENT'])
    .optional()
    .default('CLIENT')
});
```

**Additional Validations**:
- Email uniqueness check (repository layer)
- Only ADMIN can set role to ADMIN or OPERATOR
- Password must be hashed before storage

### User Update

**Updatable Fields**:
```typescript
const UpdateUserSchema = z.object({
  email: z.string().email().max(255).toLowerCase().optional(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).optional(),
  name: z.string().min(1).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  address: z.string().min(1).max(500).optional(),
  role: z.enum(['ADMIN', 'OPERATOR', 'CLIENT']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DELETED']).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided'
});
```

**Business Rules**:
- At least one field must be provided
- Email uniqueness check if email is being changed
- Password must be hashed if provided
- Only ADMIN can change role or status
- Users cannot change their own role

### Login Credentials

**Required Fields**:
```typescript
const LoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1, 'Password is required')
});
```

**Validation Flow**:
1. Schema validation (format check)
2. User existence check (repository)
3. Password verification (bcrypt compare)
4. Account status check (must be ACTIVE)

## Storage Implementation (In-Memory)

### Repository Interfaces

**IUserRepository**:
```typescript
interface IUserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(filters?: UserFilters): Promise<User[]>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>; // Soft delete (status = DELETED)
}
```

**ISessionRepository**:
```typescript
interface ISessionRepository {
  create(session: Session): Promise<void>;
  findByToken(token: string): Promise<Session | null>;
  deleteByToken(token: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>; // Delete all user sessions
}
```

### In-Memory Data Structures

**User Storage**:
```typescript
class InMemoryUserRepository implements IUserRepository {
  private users = new Map<string, User>();          // id → User
  private emailIndex = new Map<string, string>();   // email → id (for fast lookup)

  async findByEmail(email: string): Promise<User | null> {
    const id = this.emailIndex.get(email.toLowerCase());
    return id ? this.users.get(id) || null : null;
  }

  async create(user: User): Promise<User> {
    this.users.set(user.id, user);
    this.emailIndex.set(user.email.toLowerCase(), user.id);
    return user;
  }
}
```

**Session Storage**:
```typescript
class InMemorySessionRepository implements ISessionRepository {
  private sessions = new Map<string, Session>();  // token → Session

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
}
```

## Response DTOs (API Contracts)

### UserResponse

**Purpose**: Safe user representation for API responses (excludes password)

```typescript
interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  role: Role;
  status: UserStatus;
  createdAt: string;  // ISO 8601 string
  updatedAt: string;  // ISO 8601 string
}

function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    address: user.address,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
  // Note: password field is intentionally omitted
}
```

### LoginResponse

**Purpose**: Return session token after successful authentication

```typescript
interface LoginResponse {
  data: {
    token: string;
    user: UserResponse;
  };
  message: string;
}
```

### ProfileResponse

**Purpose**: Authenticated user's own profile (same as UserResponse)

```typescript
type ProfileResponse = UserResponse;
```

## Indexes and Performance

### Primary Indexes

**User Entity**:
- Primary: `id` (UUID) - O(1) lookup via Map
- Unique: `email` (lowercase) - O(1) lookup via secondary index Map

**Session Entity**:
- Primary: `token` (JWT) - O(1) lookup via Map

### Query Patterns

**Most Common Queries**:
1. `findByEmail(email)` - Login, duplicate check - **O(1)**
2. `findById(id)` - Profile lookup, authorization - **O(1)**
3. `findByToken(token)` - Session validation - **O(1)**
4. `findAll()` - Admin user listing - **O(n)** (acceptable for ≤10k users)

**Optimization Notes**:
- Map-based storage provides O(1) lookups
- Secondary index on email prevents O(n) scans
- No pagination needed for 10k user requirement
- In-memory means no network/disk I/O latency

## Migration to Database (Future)

### Schema Mapping

**User Table** (SQL example):
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(500) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'OPERATOR', 'CLIENT')),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DELETED')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
```

**Session Table** (SQL example):
```sql
CREATE TABLE sessions (
  token VARCHAR(500) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

### Repository Swap

**No changes required to**:
- Service layer
- Controller layer
- Entity definitions
- DTO definitions

**Only changes required**:
- Repository implementations (InMemory → Database)
- Add database connection initialization
- Add migration files

## Summary

**Entities**: User, Session, Role (enum), UserStatus (enum)

**Relationships**:
- User 1:N Session
- User N:1 Role (enum)

**Key Validation Rules**:
- Email unique, lowercase, valid format
- Password min 8 chars, 1 upper, 1 lower, 1 number
- Phone E.164 format
- Default role: CLIENT
- Default status: ACTIVE
- Sessions expire in 1 hour

**Storage**: In-memory with Map-based O(1) lookups

**Future-Proof**: Repository pattern enables database swap without touching business logic
