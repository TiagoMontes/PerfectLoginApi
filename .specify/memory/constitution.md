<!--
Sync Impact Report:
- Version: N/A → 1.0.0 (MAJOR - Initial constitution)
- Modified Principles: N/A (new constitution)
- Added Sections: All (initial creation)
- Removed Sections: None
- Templates Status:
  ✅ .specify/templates/plan-template.md (reviewed - Constitution Check section ready)
  ✅ .specify/templates/spec-template.md (reviewed - requirements alignment confirmed)
  ✅ .specify/templates/tasks-template.md (reviewed - task categorization compatible)
- Follow-up TODOs: None
-->

# Login API Constitution

## Core Principles

### I. RESTful API Design

Every endpoint MUST follow REST principles and HTTP specifications:

- HTTP methods used semantically: GET (read), POST (create), PUT (update), PATCH (partial update), DELETE (remove)
- Status codes used correctly: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error)
- Resources named as nouns (e.g., `/users`, `/auth/login`) not verbs (e.g., `/getUser`, `/doLogin`)
- Request/response bodies MUST use JSON with consistent structure
- Error responses MUST include meaningful error codes and messages

**Rationale**: Proper REST design ensures the API is intuitive, predictable, and follows industry standards, making it an excellent learning resource and production-ready example.

### II. Layered Architecture (MVC Pattern)

Code MUST be organized into clear layers with strict separation of concerns:

- **Controllers** (`controllers/`): Handle HTTP request/response, input validation, delegate to services
- **Services** (`services/`): Contain business logic, orchestrate operations, remain protocol-agnostic
- **Entities** (`entities/`): Define data models and schemas
- **Routes** (`routes/`): Define endpoint mappings and middleware chains
- Each layer MUST only interact with adjacent layers (Routes → Controllers → Services → Entities)
- Business logic MUST NOT appear in controllers or routes
- Controllers MUST NOT directly access entities

**Rationale**: Layered architecture enables independent testing of each layer, makes the codebase easier to understand and maintain, and clearly demonstrates separation of concerns for educational purposes.

### III. Security First (NON-NEGOTIABLE)

Security MUST be embedded at every level:

- Passwords MUST be hashed using bcrypt or Argon2 (NEVER stored in plain text)
- Authentication tokens MUST use secure JWT implementation with proper expiration
- Input validation MUST occur at the controller layer (validate all user inputs)
- SQL injection prevention MUST use parameterized queries or ORM
- Secrets and credentials MUST NEVER be committed to version control
- Environment variables MUST be used for configuration (Bun loads .env automatically)
- Rate limiting MUST be implemented on authentication endpoints
- HTTPS MUST be used in production (development may use HTTP)

**Rationale**: Security vulnerabilities in authentication systems can lead to catastrophic data breaches. This API serves as a reference implementation, so security best practices are non-negotiable.

### IV. Test-Driven Development

Testing is mandatory following the Red-Green-Refactor cycle:

- Tests MUST be written before implementation
- Tests MUST fail initially (Red)
- Implementation MUST make tests pass (Green)
- Code MUST be refactored while keeping tests passing (Refactor)
- Use `bun test` for all testing
- Focus areas requiring tests:
  - Authentication flows (login, token validation)
  - Authorization rules (access control)
  - Input validation (malformed requests, edge cases)
  - Error handling (invalid credentials, expired tokens)

**Rationale**: TDD ensures code correctness, prevents regressions, and creates living documentation of how the API should behave.

### V. Simplicity & Clarity

Code MUST prioritize readability and maintainability over cleverness:

- YAGNI (You Aren't Gonna Need It): Don't build features that aren't explicitly required
- No premature abstractions: Three instances before creating a helper/utility
- Explicit is better than implicit: Clear variable names, obvious control flow
- Avoid over-engineering: Start simple, add complexity only when needed
- Code MUST be self-documenting: Use clear function/variable names before adding comments
- TypeScript types MUST be explicit (avoid `any`)

**Rationale**: This API serves as a learning resource. Simple, clear code is easier to understand, modify, and learn from than clever, complex solutions.

## Technology Stack

**Runtime**: Bun (NOT Node.js)
- Use `bun <file>` to run TypeScript directly
- Use `bun test` for testing
- Use `Bun.serve()` for HTTP server (NOT Express)
- Use `bun:sqlite` for database (if SQLite chosen)
- Bun automatically loads .env files (no dotenv package needed)

**Language**: TypeScript
- Strict mode enabled
- Explicit types required
- No `any` types without justification

**Architecture Pattern**: MVC (Model-View-Controller) adapted for APIs
- Models = Entities (data layer)
- Controllers = Request handlers
- Views = JSON responses (no HTML templating)

## Development Workflow

**Version Control**:
- Feature branches follow naming: `feature/description`
- Commit messages follow conventional commits: `type(scope): description`
- All commits MUST pass tests before pushing

**Code Review**:
- Controllers MUST NOT contain business logic
- Security practices MUST be verified (password hashing, input validation)
- HTTP status codes MUST be semantically correct
- Tests MUST exist and pass for new features

**Quality Gates**:
- All tests MUST pass before merging
- TypeScript MUST compile without errors
- Security vulnerabilities MUST be addressed before deployment
- Code MUST follow the layered architecture pattern

## Governance

This constitution supersedes all other development practices and decisions.

**Amendment Procedure**:
- Amendments require clear justification and documentation
- Constitution version MUST be incremented according to semantic versioning
- All affected templates and documentation MUST be updated to reflect changes
- Use the `/speckit.constitution` command to update this document

**Compliance Review**:
- All pull requests MUST verify compliance with these principles
- Architecture violations MUST be documented in the implementation plan's Complexity Tracking section
- Any complexity added beyond these principles MUST be justified with clear rationale
- Security principle violations are NOT ALLOWED under any circumstances

**Runtime Guidance**:
- Use `CLAUDE.md` for runtime development guidance and tool preferences
- Constitution principles override runtime preferences when conflicts arise
- For Bun-specific patterns and APIs, refer to `node_modules/bun-types/docs/**.mdx`

**Version**: 1.0.0 | **Ratified**: 2026-02-14 | **Last Amended**: 2026-02-14
