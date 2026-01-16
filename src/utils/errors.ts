import { FastifyReply } from 'fastify';
import type { ApiError } from '../types/index.js';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super('FORBIDDEN', message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class MicroserviceError extends AppError {
  constructor(
    message: string,
    public microservice: string,
    statusCode: number = 502
  ) {
    super('MICROSERVICE_ERROR', message, statusCode);
  }
}

export function handleError(error: unknown, reply: FastifyReply): void {
  if (error instanceof AppError) {
    const apiError: ApiError = {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    };
    reply.status(error.statusCode).send(apiError);
    return;
  }

  if (error instanceof Error) {
    const apiError: ApiError = {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An internal error occurred'
        : error.message,
    };
    reply.status(500).send(apiError);
    return;
  }

  const apiError: ApiError = {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
  };
  reply.status(500).send(apiError);
}
