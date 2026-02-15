# Implementation Plan: User Authentication & Management API

**Branch**: `001-user-auth-api` | **Date**: 2026-02-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-user-auth-api/spec.md`

## Summary

Implement a secure RESTful authentication and user management API with role-based access control (RBAC) supporting three permission levels: Administrator, Operator, and Client. The system will provide user registration, login/logout, session management, and full CRUD operations on user profiles with role-specific permissions. Initial implementation uses in-memory storage with a modular architecture designed for future database integration.

**Core Capabilities**: JWT-based session management, secure password hashing, input validation with Zod schemas, layered MVC architecture following constitution principles.

## Technical Context

**Language/Version**: TypeScript with Bun runtime (latest stable)
**Primary Dependencies**:
- Fastify (HTTP server and routing framework)
- Bun built-in APIs (Bun.password)
- Zod (input validation schemas)
- jsonwebtoken (JWT token generation/validation)

**Storage**: In-memory data structures (Map/Array) - no database persistence initially
**Testing**: bun test with test files co-located by feature
**Target Platform**: RESTful API server (development on macOS, production on Linux)
**Project Type**: Single backend API project
**Performance Goals**:
- Registration/login: < 5 seconds (per SC-002)
- Session validation: < 100ms per request
- User listing (10k users): < 3 seconds (per SC-005)

**Constraints**:
- 1-hour session expiration (per clarifications)
- No database - in-memory storage only
- Security-first design (password hashing, no sensitive data exposure)
- Clean code without comments per constitution

**Scale/Scope**:
- Support up to 10,000 users in memory
- 6 main API endpoint groups (auth, users, profile)
- 3 permission levels (RBAC)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. RESTful API Design ✅ COMPLIANT

- HTTP methods will be used semantically (GET for read, POST for create, PUT/PATCH for update, DELETE for remove)
- Status codes aligned with spec requirements:
  - 200 OK (successful operations)
  - 201 Created (user registration)
  - 400 Bad Request (validation errors)
  - 401 Unauthorized (invalid/missing auth)
  - 403 Forbidden (role-based access denied)
  - 404 Not Found (user not found)
  - 409 Conflict (duplicate email)
- Resource naming: `/auth/login`, `/auth/logout`, `/users`, `/users/:id`, `/profile`
- JSON request/response with consistent structure (data/error/message fields per clarifications)

### II. Layered Architecture (MVC Pattern) ✅ COMPLIANT

Planned structure:
- **Routes** (`src/routes/`): Define endpoint mappings, attach middleware. Each entity has its own route file exported as Fastify plugin, registered in `src/index.ts`
- **Controllers** (`src/controllers/`): Handle HTTP I/O, validate with Zod, delegate to services
- **Services** (`src/services/`): Business logic, RBAC enforcement, session management
- **Entities** (`src/entities/`): User, Role, Session type definitions
- **DTOs** (`src/dtos/`): Request/response type definitions and Zod schemas

**Route Organization Pattern**:
- Routes centralized by entity (e.g., `auth.routes.ts`, `users.routes.ts`)
- Each route file exports a Fastify plugin function
- All routes registered in `src/index.ts` using `app.register()`

**Layer interaction**: Routes → Controllers → Services → Entities (strict one-way)
**No violations**: Business logic stays in services, controllers remain thin

### III. Security First (NON-NEGOTIABLE) ✅ COMPLIANT

Security measures aligned with requirements:
- Passwords hashed with bcrypt (Bun.password.hash)
- JWT tokens with 1-hour expiration (per clarifications)
- Input validation at controller layer using Zod schemas (per FR-002a-d)
- No secrets in code - .env for JWT_SECRET
- HTTPS required in production
- Rate limiting explicitly out of scope (documented in spec)

**Constitution override**: Rate limiting is NON-NEGOTIABLE per constitution but OUT OF SCOPE per spec. **REQUIRES JUSTIFICATION IN COMPLEXITY TRACKING**.

### IV. Test-Driven Development ✅ COMPLIANT

TDD approach for:
- Authentication flows (login, logout, token validation)
- Authorization rules (RBAC for Admin/Operator/Client)
- Input validation (email, password, phone, required fields)
- Error handling (invalid credentials, expired tokens, duplicate registration)

Tests written before implementation using `bun test`.

### V. Simplicity & Clarity ✅ COMPLIANT

- YAGNI: Only implementing specified features, no extras
- No premature abstractions: In-memory storage is simplest for MVP
- Explicit types: All DTOs and entities will have TypeScript interfaces
- Self-documenting code: Clear function/variable names, no comments per constitution
- No `any` types

### Constitution Compliance Summary

**Status**: ✅ **PASSES** with 1 justified exception

**Exception**: Rate limiting is constitution-mandated but spec declares it out of scope. Justified in Complexity Tracking below.

## Project Structure

### Documentation (this feature)

```text
specs/001-user-auth-api/
├── plan.md              # This file (/speckit.plan output)
├── spec.md              # Feature specification
├── research.md          # Phase 0: Technology decisions and patterns
├── data-model.md        # Phase 1: Entity definitions and relationships
├── quickstart.md        # Phase 1: Developer setup guide
├── contracts/           # Phase 1: API contract definitions
│   ├── auth.openapi.yaml
│   ├── users.openapi.yaml
│   └── profile.openapi.yaml
├── checklists/
│   └── requirements.md  # Spec quality validation (already exists)
└── tasks.md             # Phase 2: Implementation tasks (/speckit.tasks - not created yet)
```

### Source Code (repository root)

```text
src/
├── entities/
│   ├── User.ts          # User entity with fields: email, password, name, phone, address, role, status
│   ├── Role.ts          # Role enum: ADMIN, OPERATOR, CLIENT
│   └── Session.ts       # Session entity with token, userId, expiresAt
├── dtos/
│   ├── auth/
│   │   ├── LoginRequest.ts
│   │   ├── LoginResponse.ts
│   │   └── LogoutResponse.ts
│   ├── users/
│   │   ├── CreateUserRequest.ts
│   │   ├── UpdateUserRequest.ts
│   │   ├── UserResponse.ts
│   │   └── UsersListResponse.ts
│   └── profile/
│       ├── ProfileResponse.ts
│       └── UpdateProfileRequest.ts
├── services/
│   ├── AuthService.ts   # Login, logout, token validation, session management
│   ├── UserService.ts   # User CRUD, role assignment, RBAC checks
│   └── HashService.ts   # Password hashing/verification wrapper
├── controllers/
│   ├── AuthController.ts    # /auth/login, /auth/logout
│   ├── UserController.ts    # /users CRUD endpoints
│   └── ProfileController.ts # /profile endpoints
├── routes/
│   ├── auth.routes.ts       # Authentication routes (login, logout)
│   ├── users.routes.ts      # User CRUD routes
│   └── profile.routes.ts    # Profile management routes
│   # Note: Routes are registered in src/index.ts, no index.ts needed here
├── middleware/
│   ├── authenticate.ts  # JWT validation middleware
│   ├── authorize.ts     # RBAC enforcement middleware
│   └── errorHandler.ts  # Global error handling
├── repositories/
│   ├── UserRepository.ts    # In-memory user storage (Map)
│   └── SessionRepository.ts # In-memory session storage (Map)
├── utils/
│   ├── jwt.ts           # JWT sign/verify helpers
│   └── validators.ts    # Zod schema definitions
└── index.ts             # Fastify entry point

tests/
├── unit/
│   ├── services/
│   │   ├── AuthService.test.ts
│   │   ├── UserService.test.ts
│   │   └── HashService.test.ts
│   ├── middleware/
│   │   ├── authenticate.test.ts
│   │   └── authorize.test.ts
│   └── utils/
│       └── validators.test.ts
├── integration/
│   ├── auth.test.ts     # Login/logout flows
│   ├── users.test.ts    # User CRUD operations
│   └── profile.test.ts  # Profile management
└── fixtures/
    └── testData.ts      # Shared test user data

.env.example             # Template for environment variables
```

**Structure Decision**: Single backend API project (Option 1 from template). The feature is purely backend with no frontend component. MVC architecture with additional Repository layer for data access abstraction (justified in Complexity Tracking due to future database migration requirement).

## Complexity Tracking

> Documenting constitution violations requiring justification

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Rate limiting omitted (Security First principle) | Spec explicitly declares rate limiting out of scope for MVP | Adding rate limiting violates spec requirements; can be added in future iteration when moved from "Out of Scope" to "In Scope" |
| Repository pattern added (Simplicity principle) | User input explicitly requested "Repository" pattern; enables future database swap without touching services | Direct in-memory access would couple services to storage implementation, making database migration harder |

**Justification for Repository Pattern**: While the constitution emphasizes simplicity and avoiding premature abstraction, the user explicitly requested "Controller, Repository, Entity, DTO's, Routes patterns" in the original input. The Repository pattern here serves two purposes:
1. Honors user's architectural preference
2. Provides clean abstraction boundary for future database integration without violating YAGNI (we ARE going to need database eventually, just not in MVP)

**Rate Limiting Exception**: The constitution mandates rate limiting on auth endpoints, but the spec explicitly excludes it. This is resolved by:
- Documenting in spec's "Out of Scope" section
- Planning architecture to support future addition (middleware-based design)
- No current implementation

## Phase 0: Research & Technology Decisions

See [research.md](./research.md) for detailed findings.

**Key Decisions**:
1. **JWT Library**: Use `jsonwebtoken` package for token generation/validation
2. **Password Hashing**: Use Bun.password.hash (bcrypt-based) built into Bun runtime
3. **Validation**: Zod schemas for all DTOs
4. **Testing**: bun test with describe/it/expect patterns
5. **Error Handling**: Custom error classes with HTTP status codes

## Phase 1: Design Artifacts

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions and relationships.

**Core Entities**:
- User (email, password, name, phone, address, role, createdAt, updatedAt)
- Session (token, userId, expiresAt, createdAt)
- Role (ADMIN, OPERATOR, CLIENT enum)

### API Contracts

See [contracts/](./contracts/) directory for OpenAPI specifications.

**Endpoint Groups**:
- Authentication: POST /auth/login, POST /auth/logout
- Users: GET /users, GET /users/:id, POST /users, PUT /users/:id, DELETE /users/:id
- Profile: GET /profile, PUT /profile

### Developer Quickstart

See [quickstart.md](./quickstart.md) for setup instructions and API usage examples.

## Next Steps

After this plan is approved:
1. Run `/speckit.tasks` to generate dependency-ordered implementation tasks
2. Begin TDD implementation starting with highest-priority user stories (P1)
3. Implement Phase 1 artifacts (data model, contracts) before coding
