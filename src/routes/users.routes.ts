import { FastifyInstance } from 'fastify';
import { authenticateUser } from '../middlewares/auth.js';
import { usersClient } from '../services/microservice.client.js';
import {
  UpdateUserRequestSchema,
  ChangePasswordRequestSchema,
  UpdatePreferencesRequestSchema,
} from '../schemas/user.schemas.js';
import { SessionIdParamSchema } from '../schemas/common.schemas.js';
import { ValidationError } from '../utils/errors.js';

export async function usersRoutes(fastify: FastifyInstance): Promise<void> {
  // Get current user profile
  fastify.get('/users/me', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const user = await usersClient.get('/users/me', undefined, request.user);
    reply.send(user);
  });

  // Update user profile
  fastify.patch('/users/me', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const body = UpdateUserRequestSchema.parse(request.body);
    const user = await usersClient.patch('/users/me', body, request.user);
    reply.send(user);
  });

  // Update user preferences
  fastify.patch('/users/me/preferences', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const body = UpdatePreferencesRequestSchema.parse(request.body);
    await usersClient.patch('/users/me/preferences', body, request.user);
    reply.status(200).send();
  });

  // List active sessions
  fastify.get('/users/me/sessions', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const sessions = await usersClient.get('/users/me/sessions', undefined, request.user);
    reply.send(sessions);
  });

  // Revoke session
  fastify.delete('/users/me/sessions/:sessionId', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = SessionIdParamSchema.parse(request.params);
    await usersClient.delete(`/users/me/sessions/${params.sessionId}`, request.user);
    reply.status(204).send();
  });

  // Change password
  fastify.post('/users/change-password', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const body = ChangePasswordRequestSchema.parse(request.body);
    await usersClient.post('/users/change-password', body, request.user);
    reply.status(200).send();
  });
}
