import { FastifyInstance } from 'fastify';
import { authenticateUser } from '../middlewares/auth.js';
import { notificationsClient } from '../services/microservice.client.js';
import {
  SendInvitationRequestSchema,
  ScheduleReminderRequestSchema,
} from '../schemas/notification.schemas.js';
import { InvitationIdParamSchema } from '../schemas/common.schemas.js';

export async function notificationsRoutes(fastify: FastifyInstance): Promise<void> {
  // Send signing invitation to party
  fastify.post('/notifications/send-invitation', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const body = SendInvitationRequestSchema.parse(request.body);
    const result = await notificationsClient.post('/notifications/send-invitation', body, request.user);
    reply.send(result);
  });

  // Cancel pending invitation
  fastify.post('/notifications/invitations/:invitationId/cancel', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = InvitationIdParamSchema.parse(request.params);
    await notificationsClient.post(`/notifications/invitations/${params.invitationId}/cancel`, undefined, request.user);
    reply.status(200).send();
  });

  // Resend invitation
  fastify.post('/notifications/invitations/:invitationId/resend', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = InvitationIdParamSchema.parse(request.params);
    await notificationsClient.post(`/notifications/invitations/${params.invitationId}/resend`, undefined, request.user);
    reply.status(200).send();
  });

  // Get available email templates
  fastify.get('/notifications/templates', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const templates = await notificationsClient.get('/notifications/templates', undefined, request.user);
    reply.send(templates);
  });

  // Configure reminder for unsigned contract
  fastify.post('/notifications/reminders', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const body = ScheduleReminderRequestSchema.parse(request.body);
    await notificationsClient.post('/notifications/reminders', body, request.user);
    reply.status(201).send();
  });
}
