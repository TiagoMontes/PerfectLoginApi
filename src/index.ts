import { loadEnv } from './utils/env';
import { success } from './utils/response';
import { handleError } from './middleware/errorHandler';
import { mapRoutesForBun } from './utils/routeMapper';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/users.routes';

const env = loadEnv();

Bun.serve({
  port: env.PORT,
  routes: {
    '/health': {
      GET: async () => {
        try {
          return Response.json(
            success({ status: 'ok', timestamp: new Date().toISOString() }, 'Service is healthy'),
            { status: 200 }
          );
        } catch (error) {
          return handleError(error as Error);
        }
      }
    },
    ...mapRoutesForBun({ ...authRoutes, ...userRoutes })
  },
  fetch() {
    return Response.json(
      { error: 'NotFound', message: 'Route not found' },
      { status: 404 }
    );
  },
  development: {
    hmr: true
  }
});

console.log(`Server running on http://localhost:${env.PORT}`);
console.log(`Environment: ${env.NODE_ENV}`);
