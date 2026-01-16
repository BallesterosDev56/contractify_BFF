import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from './config/env.js';
import { initializeFirebase } from './middlewares/auth.js';
import { handleError } from './utils/errors.js';
import { logger } from './utils/logger.js';

// Import routes
import { usersRoutes } from './routes/users.routes.js';
import { contractsRoutes } from './routes/contracts.routes.js';
import { templatesRoutes } from './routes/templates.routes.js';
import { aiRoutes } from './routes/ai.routes.js';
import { documentsRoutes } from './routes/documents.routes.js';
import { signaturesRoutes } from './routes/signatures.routes.js';
import { notificationsRoutes } from './routes/notifications.routes.js';
import { auditRoutes } from './routes/audit.routes.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: config.nodeEnv === 'development',
    requestIdLogLabel: 'reqId',
    requestIdHeader: 'x-request-id',
  });

  // Initialize Firebase Admin SDK
  try {
    initializeFirebase();
    logger.info('Firebase Admin SDK initialized');
  } catch (error) {
    logger.error('Failed to initialize Firebase:', error);
    throw error;
  }

  // Security headers
  await app.register(helmet, {
    contentSecurityPolicy: false, // Adjust based on your needs
  });

  // CORS
  await app.register(cors, {
    origin: config.corsOrigin,
    credentials: true,
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
  });

  // Error handler
  app.setErrorHandler((error, request, reply) => {
    handleError(error, reply);
  });

  // Health check endpoint
  app.get('/health', async (_request, reply) => {
    reply.send({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Register routes
  await app.register(usersRoutes);
  await app.register(contractsRoutes);
  await app.register(templatesRoutes);
  await app.register(aiRoutes);
  await app.register(documentsRoutes);
  await app.register(signaturesRoutes);
  await app.register(notificationsRoutes);
  await app.register(auditRoutes);

  return app;
}
