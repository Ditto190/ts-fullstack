import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { db } from '@app/db';
import { userRoutes } from './routes/users.js';
import { postRoutes } from './routes/posts.js';

const PORT = parseInt(process.env["PORT"] ?? '3000', 10);
const HOST = process.env["HOST"] ?? '0.0.0.0';

const server = Fastify({
  logger: {
    transport:
      process.env["NODE_ENV"] === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
});

// Security & Rate Limiting
await server.register(helmet);
await server.register(cors, {
  origin: process.env["CORS_ORIGIN"] ?? 'http://localhost:5173',
  credentials: true,
});
await server.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Health check
server.get('/health', async () => {
  try {
    await db.$queryRaw`SELECT 1`;
    return { status: 'ok', timestamp: new Date().toISOString() };
  } catch (error) {
    server.log.error(error);
    throw new Error('Database connection failed');
  }
});

// API Routes
await server.register(userRoutes, { prefix: '/api/users' });
await server.register(postRoutes, { prefix: '/api/posts' });

// Graceful shutdown
const shutdown = async (): Promise<void> => {
  server.log.info('Shutting down gracefully...');
  await server.close();
  await db.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
try {
  await server.listen({ port: PORT, host: HOST });
  server.log.info(`🚀 API server running at http://${HOST}:${PORT}`);
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
