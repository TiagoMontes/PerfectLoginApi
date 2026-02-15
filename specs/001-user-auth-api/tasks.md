# Tasks: User Authentication & Management API

**Input**: Design documents from `/specs/001-user-auth-api/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: Following TDD approach per constitution - tests written BEFORE implementation

**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Include exact file paths in descriptions

## Path Conventions

Single backend API project - all paths relative to repository root:
- Source: `src/`
- Tests: `tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project directory structure per plan.md (src/, tests/, specs/)
- [X] T002 Initialize Bun project with package.json and TypeScript configuration
- [X] T003 [P] Install dependencies: jsonwebtoken, zod, @types/jsonwebtoken
- [X] T004 [P] Create .env.example file with JWT_SECRET, PORT, NODE_ENV templates
- [X] T005 [P] Configure TypeScript strict mode in tsconfig.json
- [X] T006 [P] Setup .gitignore for .env, node_modules, dist

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 [P] Create Role enum in src/entities/Role.ts (ADMIN, OPERATOR, CLIENT)
- [X] T008 [P] Create UserStatus enum in src/entities/UserStatus.ts (ACTIVE, INACTIVE, DELETED)
- [X] T009 [P] Create User entity interface in src/entities/User.ts
- [X] T010 [P] Create Session entity interface in src/entities/Session.ts
- [X] T011 [P] Create base error classes in src/utils/errors.ts (UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError)
- [X] T012 [P] Create JWT utility functions in src/utils/jwt.ts (sign, verify)
- [X] T013 [P] Create IUserRepository interface in src/repositories/IUserRepository.ts
- [X] T014 [P] Create ISessionRepository interface in src/repositories/ISessionRepository.ts
- [X] T015 [P] Setup global error handler middleware in src/middleware/errorHandler.ts
- [X] T016 [P] Create API response helper functions in src/utils/response.ts (success, error formatters)
- [X] T017 [P] Create base Zod schemas in src/utils/validators.ts (email, password, phone patterns)
- [X] T018 Setup Fastify entry point in src/index.ts with basic health check endpoint
- [X] T019 Create environment variable loader in src/utils/env.ts with validation

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration & Authentication (Priority: P1) 🎯 MVP

**Goal**: Allow new users to create accounts and authenticate with email/password, receiving a JWT token for session management

**Independent Test**: Create a new account with valid credentials, login with those credentials, receive a token, and access a protected resource using that token

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T020 [P] [US1] Unit test for HashService.hash in tests/unit/services/HashService.test.ts
- [ ] T021 [P] [US1] Unit test for HashService.verify in tests/unit/services/HashService.test.ts
- [ ] T022 [P] [US1] Unit test for AuthService.login in tests/unit/services/AuthService.test.ts
- [ ] T023 [P] [US1] Unit test for AuthService.logout in tests/unit/services/AuthService.test.ts
- [ ] T024 [P] [US1] Unit test for UserService.createUser in tests/unit/services/UserService.test.ts
- [ ] T025 [P] [US1] Integration test for POST /users (signup) in tests/integration/auth.test.ts
- [ ] T026 [P] [US1] Integration test for POST /auth/login in tests/integration/auth.test.ts
- [ ] T027 [P] [US1] Integration test for POST /auth/logout in tests/integration/auth.test.ts
- [ ] T028 [P] [US1] Integration test for invalid credentials in tests/integration/auth.test.ts
- [ ] T029 [P] [US1] Integration test for duplicate email registration in tests/integration/auth.test.ts

### Implementation for User Story 1

**DTOs**:
- [X] T030 [P] [US1] Create LoginRequest DTO with Zod schema in src/dtos/auth/LoginRequest.ts
- [X] T031 [P] [US1] Create LoginResponse DTO in src/dtos/auth/LoginResponse.ts
- [X] T032 [P] [US1] Create LogoutResponse DTO in src/dtos/auth/LogoutResponse.ts
- [X] T033 [P] [US1] Create CreateUserRequest DTO with Zod schema in src/dtos/users/CreateUserRequest.ts
- [X] T034 [P] [US1] Create UserResponse DTO in src/dtos/users/UserResponse.ts

**Repositories**:
- [X] T035 [P] [US1] Implement InMemoryUserRepository in src/repositories/UserRepository.ts (with Map storage and email index)
- [X] T036 [P] [US1] Implement InMemorySessionRepository in src/repositories/SessionRepository.ts (with auto-expiration check)
- [X] T037 [P] [US1] Create test fixtures for User data in tests/fixtures/testData.ts

**Services**:
- [X] T038 [US1] Implement HashService in src/services/HashService.ts (using Bun.password.hash)
- [X] T039 [US1] Implement AuthService.login in src/services/AuthService.ts (verify credentials, create session, return token)
- [X] T040 [US1] Implement AuthService.logout in src/services/AuthService.ts (invalidate session)
- [X] T041 [US1] Implement AuthService.validateToken in src/services/AuthService.ts (verify JWT, check session)
- [X] T042 [US1] Implement UserService.createUser in src/services/UserService.ts (validate uniqueness, hash password, assign default role)

**Middleware**:
- [X] T043 [US1] Implement authenticate middleware in src/middleware/authenticate.ts (validate JWT, attach user to request)
- [X] T044 [US1] Unit test for authenticate middleware in tests/unit/middleware/authenticate.test.ts

**Controllers**:
- [X] T045 [US1] Implement AuthController.login in src/controllers/AuthController.ts
- [X] T046 [US1] Implement AuthController.logout in src/controllers/AuthController.ts
- [X] T047 [US1] Implement UserController.create in src/controllers/UserController.ts (signup endpoint)

**Routes**:
- [X] T048 [US1] Setup auth routes in src/routes/auth.routes.ts (POST /auth/login, POST /auth/logout)
- [X] T049 [US1] Setup user creation route in src/routes/users.routes.ts (POST /users)
- [X] T050 [US1] Integrate routes into src/index.ts Fastify instance

**Integration**:
- [X] T051 [US1] Run all User Story 1 tests to verify independent functionality
- [X] T052 [US1] Manual testing following quickstart.md authentication flow examples

**Checkpoint**: At this point, User Story 1 should be fully functional - users can register, login, logout, and receive JWT tokens. This is the MVP.

---

## Phase 4: User Story 2 - Role-Based Access Control (Priority: P1)

**Goal**: Enforce role-based permissions (ADMIN, OPERATOR, CLIENT) consistently across all operations to prevent unauthorized access

**Independent Test**: Create users with different roles (ADMIN, OPERATOR, CLIENT), verify each role can only perform their permitted actions, and confirm unauthorized operations are denied with 403 errors

### Tests for User Story 2

- [ ] T053 [P] [US2] Unit test for authorize middleware with ADMIN role in tests/unit/middleware/authorize.test.ts
- [ ] T054 [P] [US2] Unit test for authorize middleware with OPERATOR role in tests/unit/middleware/authorize.test.ts
- [ ] T055 [P] [US2] Unit test for authorize middleware with CLIENT role in tests/unit/middleware/authorize.test.ts
- [ ] T056 [P] [US2] Integration test for CLIENT attempting admin operation (should fail) in tests/integration/users.test.ts
- [ ] T057 [P] [US2] Integration test for OPERATOR read-only permissions in tests/integration/users.test.ts
- [ ] T058 [P] [US2] Integration test for ADMIN full permissions in tests/integration/users.test.ts

### Implementation for User Story 2

**Middleware**:
- [ ] T059 [US2] Implement authorize middleware factory in src/middleware/authorize.ts (check req.user.role against allowed roles)
- [ ] T060 [US2] Add RBAC checks to UserService methods in src/services/UserService.ts

**Routes**:
- [ ] T061 [US2] Apply authorize middleware to existing routes in src/routes/auth.routes.ts
- [ ] T062 [US2] Apply authorize middleware to existing routes in src/routes/users.routes.ts

**Integration**:
- [ ] T063 [US2] Run all User Story 2 tests to verify role permissions are enforced
- [ ] T064 [US2] Test RBAC matrix from data-model.md (verify all role/operation combinations)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - authentication works AND permissions are enforced

---

## Phase 5: User Story 3 - Session Management (Priority: P2)

**Goal**: Enable authenticated users to maintain sessions across multiple requests with automatic 1-hour expiration and graceful logout functionality

**Independent Test**: Login to create a session, make multiple authenticated requests successfully, logout to invalidate session, verify subsequent requests are rejected. Also test session expiration after 1 hour.

### Tests for User Story 3

- [ ] T065 [P] [US3] Unit test for session expiration logic in SessionRepository in tests/unit/repositories/SessionRepository.test.ts
- [ ] T066 [P] [US3] Integration test for multiple authenticated requests with same token in tests/integration/auth.test.ts
- [ ] T067 [P] [US3] Integration test for expired session rejection in tests/integration/auth.test.ts
- [ ] T068 [P] [US3] Integration test for multi-device sessions (concurrent tokens) in tests/integration/auth.test.ts
- [ ] T069 [P] [US3] Integration test for logout from one device in tests/integration/auth.test.ts

### Implementation for User Story 3

**Services**:
- [ ] T070 [US3] Add session cleanup method to SessionRepository in src/repositories/SessionRepository.ts
- [ ] T071 [US3] Enhance AuthService.validateToken to handle expired sessions in src/services/AuthService.ts
- [ ] T072 [US3] Add deleteAllUserSessions method to SessionRepository in src/repositories/SessionRepository.ts

**Integration**:
- [ ] T073 [US3] Run all User Story 3 tests to verify session lifecycle works correctly
- [ ] T074 [US3] Test session expiration scenario from quickstart.md

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - users can manage sessions with automatic expiration

---

## Phase 6: User Story 4 - User Profile Management (Priority: P2)

**Goal**: Allow authenticated users to view and update their own profile information while maintaining data integrity and security

**Independent Test**: Login as a user, retrieve own profile data, update profile fields (name, phone, address), verify changes persist and are returned in subsequent profile requests

### Tests for User Story 4

- [ ] T075 [P] [US4] Unit test for UserService.getProfile in tests/unit/services/UserService.test.ts
- [ ] T076 [P] [US4] Unit test for UserService.updateProfile in tests/unit/services/UserService.test.ts
- [ ] T077 [P] [US4] Integration test for GET /profile in tests/integration/profile.test.ts
- [ ] T078 [P] [US4] Integration test for PUT /profile with valid data in tests/integration/profile.test.ts
- [ ] T079 [P] [US4] Integration test for PUT /profile with invalid data in tests/integration/profile.test.ts
- [ ] T080 [P] [US4] Integration test for profile update with duplicate email in tests/integration/profile.test.ts

### Implementation for User Story 4

**DTOs**:
- [ ] T081 [P] [US4] Create ProfileResponse DTO in src/dtos/profile/ProfileResponse.ts
- [ ] T082 [P] [US4] Create UpdateProfileRequest DTO with Zod schema in src/dtos/profile/UpdateProfileRequest.ts

**Services**:
- [ ] T083 [US4] Implement UserService.getProfile in src/services/UserService.ts
- [ ] T084 [US4] Implement UserService.updateProfile in src/services/UserService.ts (validate, check email uniqueness, update user)

**Controllers**:
- [ ] T085 [P] [US4] Implement ProfileController.get in src/controllers/ProfileController.ts
- [ ] T086 [P] [US4] Implement ProfileController.update in src/controllers/ProfileController.ts

**Routes**:
- [ ] T087 [US4] Setup profile routes in src/routes/profile.routes.ts (GET /profile, PUT /profile)
- [ ] T088 [US4] Integrate profile routes into src/index.ts

**Integration**:
- [ ] T089 [US4] Run all User Story 4 tests to verify profile management works independently
- [ ] T090 [US4] Test profile update flow from quickstart.md

**Checkpoint**: At this point, all P1 and P2 user stories are complete - users can register, login, manage sessions, and update their profiles

---

## Phase 7: User Story 5 - Administrative User Management (Priority: P3)

**Goal**: Provide administrators with complete user lifecycle management capabilities including viewing all users, modifying user information, assigning roles, and removing users

**Independent Test**: Login as an ADMIN user, list all users, view a specific user by ID, update another user's information and role, delete a user account, verify changes are applied and user can no longer authenticate

### Tests for User Story 5

- [ ] T091 [P] [US5] Unit test for UserService.listUsers in tests/unit/services/UserService.test.ts
- [ ] T092 [P] [US5] Unit test for UserService.getUserById in tests/unit/services/UserService.test.ts
- [ ] T093 [P] [US5] Unit test for UserService.updateUser in tests/unit/services/UserService.test.ts
- [ ] T094 [P] [US5] Unit test for UserService.deleteUser in tests/unit/services/UserService.test.ts
- [ ] T095 [P] [US5] Integration test for GET /users in tests/integration/users.test.ts
- [ ] T096 [P] [US5] Integration test for GET /users/:id in tests/integration/users.test.ts
- [ ] T097 [P] [US5] Integration test for PUT /users/:id in tests/integration/users.test.ts
- [ ] T098 [P] [US5] Integration test for DELETE /users/:id in tests/integration/users.test.ts
- [ ] T099 [P] [US5] Integration test for OPERATOR attempting user update (should fail) in tests/integration/users.test.ts
- [ ] T100 [P] [US5] Integration test for role change affects permissions in tests/integration/users.test.ts

### Implementation for User Story 5

**DTOs**:
- [ ] T101 [P] [US5] Create UpdateUserRequest DTO with Zod schema in src/dtos/users/UpdateUserRequest.ts
- [ ] T102 [P] [US5] Create UsersListResponse DTO in src/dtos/users/UsersListResponse.ts

**Services**:
- [ ] T103 [US5] Implement UserService.listUsers in src/services/UserService.ts (exclude DELETED users, apply RBAC)
- [ ] T104 [US5] Implement UserService.getUserById in src/services/UserService.ts (verify permissions)
- [ ] T105 [US5] Implement UserService.updateUser in src/services/UserService.ts (validate, check role change permissions, update)
- [ ] T106 [US5] Implement UserService.deleteUser in src/services/UserService.ts (soft delete by setting status=DELETED)

**Controllers**:
- [ ] T107 [P] [US5] Implement UserController.list in src/controllers/UserController.ts
- [ ] T108 [P] [US5] Implement UserController.getById in src/controllers/UserController.ts
- [ ] T109 [P] [US5] Implement UserController.update in src/controllers/UserController.ts
- [ ] T110 [P] [US5] Implement UserController.delete in src/controllers/UserController.ts

**Routes**:
- [ ] T111 [US5] Add admin user routes to src/routes/users.routes.ts (GET /users, GET /users/:id, PUT /users/:id, DELETE /users/:id)
- [ ] T112 [US5] Apply authorize(ADMIN, OPERATOR) middleware to list/get routes
- [ ] T113 [US5] Apply authorize(ADMIN) middleware to update/delete routes

**Integration**:
- [ ] T114 [US5] Run all User Story 5 tests to verify admin operations work correctly
- [ ] T115 [US5] Test full admin workflow: create ADMIN user, manage other users, verify RBAC

**Checkpoint**: All user stories (P1, P2, P3) are now complete and independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T116 [P] Add comprehensive API documentation in specs/001-user-auth-api/API.md
- [ ] T117 [P] Create .env.example validation check in src/utils/env.ts
- [ ] T118 [P] Add request logging middleware in src/middleware/logger.ts
- [ ] T119 [P] Implement input sanitization for XSS prevention in src/utils/validators.ts
- [ ] T120 [P] Add edge case tests for special characters in input in tests/integration/validation.test.ts
- [ ] T121 [P] Add edge case tests for concurrent operations in tests/integration/concurrency.test.ts
- [ ] T122 Add performance test for 10k users listing in tests/integration/performance.test.ts
- [ ] T123 Code review and refactoring for constitution compliance
- [ ] T124 Security audit: verify no password exposure, secure JWT implementation
- [ ] T125 Run complete quickstart.md validation end-to-end
- [ ] T126 [P] Update README.md with project overview and setup instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - Can start after Phase 2
- **User Story 2 (Phase 4)**: Depends on Foundational AND User Story 1 (adds RBAC to existing auth)
- **User Story 3 (Phase 5)**: Depends on Foundational AND User Story 1 (enhances session management)
- **User Story 4 (Phase 6)**: Depends on Foundational AND User Story 1 (uses auth infrastructure)
- **User Story 5 (Phase 7)**: Depends on Foundational AND User Story 1 (uses auth + adds admin features)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: ⚠️ FOUNDATION - Must be complete before any other story
  - Provides: Authentication, user creation, JWT tokens, basic repositories
  - No dependencies on other user stories

- **User Story 2 (P1)**: ⚠️ CRITICAL - Builds on US1
  - **Depends on**: User Story 1 (needs auth infrastructure)
  - Provides: Role-based access control middleware
  - Status: Must complete for production-ready MVP

- **User Story 3 (P2)**: Builds on US1
  - **Depends on**: User Story 1 (enhances existing session logic)
  - Provides: Session expiration, multi-device support
  - Status: Can be done in parallel with US4/US5 after US1/US2 complete

- **User Story 4 (P2)**: Builds on US1
  - **Depends on**: User Story 1 (uses auth for profile access)
  - Provides: Self-service profile management
  - Status: Can be done in parallel with US3/US5 after US1/US2 complete

- **User Story 5 (P3)**: Builds on US1 + US2
  - **Depends on**: User Story 1 (auth) AND User Story 2 (RBAC)
  - Provides: Admin user management capabilities
  - Status: Can be done in parallel with US3/US4 after US1/US2 complete

### Within Each User Story

1. **Tests FIRST** (TDD): Write all tests for the story, ensure they FAIL
2. **DTOs**: Create request/response types (can parallelize)
3. **Repositories**: Implement data access (can parallelize if different entities)
4. **Services**: Implement business logic (depends on DTOs + Repositories)
5. **Middleware**: Add specific middleware if needed (can parallelize with controllers)
6. **Controllers**: Implement HTTP handlers (depends on Services)
7. **Routes**: Wire up endpoints (depends on Controllers)
8. **Integration**: Run tests, verify story works independently

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T003, T004, T005, T006 can all run in parallel

**Foundational Phase (Phase 2)**:
- T007-T012, T013-T017 can run in parallel (different files)

**User Story 1 - Tests**:
- All US1 tests (T020-T029) can be written in parallel

**User Story 1 - DTOs**:
- All US1 DTOs (T030-T034) can be created in parallel

**User Story 1 - Repositories**:
- T035, T036, T037 can run in parallel (different files)

**User Story 1 - Controllers**:
- T045, T046, T047 can run in parallel (different files)

**After US1+US2 Complete**:
- User Stories 3, 4, 5 can be worked on in parallel by different developers

---

## Parallel Example: User Story 1 (MVP)

```bash
# Phase 1: Write all tests in parallel (RED phase)
Task: "Unit test for HashService.hash in tests/unit/services/HashService.test.ts"
Task: "Unit test for AuthService.login in tests/unit/services/AuthService.test.ts"
Task: "Integration test for POST /users in tests/integration/auth.test.ts"
Task: "Integration test for POST /auth/login in tests/integration/auth.test.ts"
# ... all other US1 tests

# Phase 2: Create all DTOs in parallel
Task: "Create LoginRequest DTO in src/dtos/auth/LoginRequest.ts"
Task: "Create LoginResponse DTO in src/dtos/auth/LoginResponse.ts"
Task: "Create CreateUserRequest DTO in src/dtos/users/CreateUserRequest.ts"
# ... all other US1 DTOs

# Phase 3: Create repositories in parallel
Task: "Implement InMemoryUserRepository in src/repositories/UserRepository.ts"
Task: "Implement InMemorySessionRepository in src/repositories/SessionRepository.ts"

# Phase 4: Create controllers in parallel (after services complete)
Task: "Implement AuthController.login in src/controllers/AuthController.ts"
Task: "Implement AuthController.logout in src/controllers/AuthController.ts"
Task: "Implement UserController.create in src/controllers/UserController.ts"
```

---

## Parallel Example: After Foundational Complete

```bash
# Multiple developers can work on different user stories simultaneously

# Developer A: User Story 3 (Session Management)
Task: "Unit test for session expiration in SessionRepository"
Task: "Enhance session cleanup in SessionRepository"

# Developer B: User Story 4 (Profile Management)
Task: "Create ProfileResponse DTO in src/dtos/profile/"
Task: "Implement ProfileController in src/controllers/"

# Developer C: User Story 5 (Admin Management)
Task: "Create UpdateUserRequest DTO in src/dtos/users/"
Task: "Implement admin endpoints in UserController"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

**Total MVP Tasks**: 64 tasks (T001-T064)

1. Complete Phase 1: Setup (6 tasks)
2. Complete Phase 2: Foundational (13 tasks) - CRITICAL
3. Complete Phase 3: User Story 1 (33 tasks) - Authentication & Registration
4. Complete Phase 4: User Story 2 (12 tasks) - RBAC enforcement
5. **STOP and VALIDATE**: Test MVP independently
6. Deploy/demo MVP with secure authentication and role-based access

**MVP Delivers**:
- ✅ User registration (signup)
- ✅ User login/logout
- ✅ JWT token authentication
- ✅ Role-based access control (ADMIN, OPERATOR, CLIENT)
- ✅ Secure password hashing
- ✅ Input validation
- ✅ Session management basics

### Incremental Delivery (Add P2 Features)

**After MVP** (Tasks 65-115):

7. Add User Story 3: Session Management (10 tasks) - Enhanced session features
8. Add User Story 4: Profile Management (16 tasks) - Self-service profiles
9. Test and validate P1+P2 features
10. Deploy/demo enhanced version

**P1+P2 Delivers**: Everything in MVP + session expiration + user profile updates

### Full Feature Set (Add P3)

**After P1+P2** (Tasks 116-125):

11. Add User Story 5: Admin Management (25 tasks) - Complete admin capabilities
12. Complete Phase 8: Polish (11 tasks) - Final hardening
13. Test and validate all features
14. Production deployment

**Full Feature Set Delivers**: Complete authentication system with admin user management

### Parallel Team Strategy

With 3 developers after Foundational phase:

1. **Team completes Setup + Foundational together** (T001-T019)
2. **All focus on User Story 1** (T020-T052) - MVP foundation
3. **All focus on User Story 2** (T053-T064) - MVP complete
4. **Validate MVP**, then split:
   - Developer A: User Story 3 (Session Management)
   - Developer B: User Story 4 (Profile Management)
   - Developer C: User Story 5 (Admin Management)
5. **Stories integrate and test independently**

---

## TDD Workflow Reminder

For EVERY user story:

1. **RED**: Write all tests for the story FIRST
2. **Verify tests FAIL**: Run `bun test` - all new tests should fail
3. **GREEN**: Implement code to make tests pass (minimal implementation)
4. **Refactor**: Clean up code while keeping tests green
5. **Validate**: Verify story works independently per "Independent Test" criteria

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] labels**: Map tasks to user stories for traceability
- **Tests FIRST**: Follow TDD - write failing tests before implementation
- **Independent stories**: Each story should be completable and testable on its own
- **MVP focus**: User Stories 1+2 deliver a production-ready authentication system
- **Checkpoints**: Stop after each phase to validate story independently
- **Constitution compliance**: Layered architecture, security-first, TDD, Bun-specific APIs
- **Commit frequency**: Commit after each task or logical group
- **File paths**: All paths are exact and ready for implementation

**Total Tasks**: 126
- Setup: 6 tasks
- Foundational: 13 tasks (BLOCKING)
- User Story 1 (P1): 33 tasks 🎯
- User Story 2 (P1): 12 tasks 🎯
- User Story 3 (P2): 10 tasks
- User Story 4 (P2): 16 tasks
- User Story 5 (P3): 25 tasks
- Polish: 11 tasks

**MVP**: 64 tasks (Setup + Foundational + US1 + US2)
**Full Feature**: 126 tasks
