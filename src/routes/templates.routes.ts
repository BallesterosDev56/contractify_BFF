import { FastifyInstance } from 'fastify';
import { authenticateUser } from '../middlewares/auth.js';
import { templatesClient } from '../services/microservice.client.js';
import { TemplateFiltersSchema } from '../schemas/template.schemas.js';
import { TemplateIdParamSchema, TypeParamSchema } from '../schemas/common.schemas.js';

export async function templatesRoutes(fastify: FastifyInstance): Promise<void> {
  // List available contract templates
  fastify.get('/contracts/templates', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const query = TemplateFiltersSchema.parse(request.query);
    const templates = await templatesClient.get('/contracts/templates', query, request.user);
    reply.send(templates);
  });

  // Get template details
  fastify.get('/contracts/templates/:templateId', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = TemplateIdParamSchema.parse(request.params);
    const template = await templatesClient.get(`/contracts/templates/${params.templateId}`, undefined, request.user);
    reply.send(template);
  });

  // Get available contract types
  fastify.get('/contracts/types', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const types = await templatesClient.get('/contracts/types', undefined, request.user);
    reply.send(types);
  });

  // Get form schema for contract type
  fastify.get('/contracts/types/:type/schema', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = TypeParamSchema.parse(request.params);
    const schema = await templatesClient.get(`/contracts/types/${params.type}/schema`, undefined, request.user);
    reply.send(schema);
  });
}
