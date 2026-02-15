import fastify from 'fastify';
import { loadEnv } from './utils/env';
import { success } from './utils/response';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/users.routes';

const env = loadEnv();

const app = fastify({
  logger: env.NODE_ENV === 'development'
});

// Health check route
app.get('/health', async (_request, reply) => {
  return reply.status(200).send(
    success({ status: 'ok', timestamp: new Date().toISOString() }, 'Service is healthy')
  );
});

// Register route plugins
app.register(authRoutes);
app.register(userRoutes);

// Start server
const start = async () => {
  try {
    await app.listen({ port: env.PORT });
    console.log(`Server running on http://localhost:${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
