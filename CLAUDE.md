
Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- Use `Fastify` for HTTP server and routing. Fastify provides excellent TypeScript support, validation, and plugin ecosystem.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## HTTP Server

Use `Fastify` for building REST APIs with TypeScript support.

### Route Organization Pattern

- **Centralize routes by entity** in `src/routes/` (e.g., `auth.routes.ts`, `users.routes.ts`)
- **Register route plugins** in `src/index.ts` using `app.register()`
- Each route file exports a Fastify plugin function

Example route file:

```ts#src/routes/users.routes.ts
import { FastifyInstance } from 'fastify';

export async function userRoutes(app: FastifyInstance) {
  app.get('/users/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    return { id };
  });

  app.post('/users', async (request, reply) => {
    // Create user logic
  });
}
```

Main server file:

```ts#src/index.ts
import fastify from 'fastify';
import { userRoutes } from './routes/users.routes';
import { authRoutes } from './routes/auth.routes';

const app = fastify({ logger: true });

// Register route plugins
app.register(authRoutes);
app.register(userRoutes);

const start = async () => {
  try {
    await app.listen({ port: 3000 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
```

Then, run index.ts with hot reload:

```sh
bun --hot ./index.ts
```

For more information, read the Fastify docs at https://fastify.dev and Bun API docs in `node_modules/bun-types/docs/**.mdx`.

## Active Technologies
- TypeScript with Bun runtime (latest stable) (001-user-auth-api)
- In-memory data structures (Map/Array) - no database persistence initially (001-user-auth-api)

## Recent Changes
- 001-user-auth-api: Added TypeScript with Bun runtime (latest stable)
