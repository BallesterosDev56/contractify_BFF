import { buildApp } from './app.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';

async function start(): Promise<void> {
  try {
    const app = await buildApp();

    await app.listen({
      port: config.port,
      host: '0.0.0.0',
    });

    logger.info(`🚀 BFF Server running on port ${config.port}`);
    logger.info(`📋 Environment: ${config.nodeEnv}`);
    logger.info(`🔐 API Version: ${config.apiVersion}`);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

start();
