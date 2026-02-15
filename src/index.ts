import { loadEnv } from './utils/env';
import { success } from './utils/response';

const env = loadEnv();

Bun.serve({
  port: env.PORT,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/health' && req.method === 'GET') {
      return Response.json(
        success({ status: 'ok', timestamp: new Date().toISOString() }, 'Service is healthy'),
        { status: 200 }
      );
    }

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
