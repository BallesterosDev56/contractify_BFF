import { FastifyInstance } from 'fastify';
import { authenticateUser } from '../middlewares/auth.js';
import { aiClient } from '../services/microservice.client.js';
import {
  AIGenerateRequestSchema,
  AIRegenerateRequestSchema,
  ValidateInputRequestSchema,
} from '../schemas/ai.schemas.js';
import { JobIdParamSchema } from '../schemas/common.schemas.js';

export async function aiRoutes(fastify: FastifyInstance): Promise<void> {
  // Validate form inputs before generation
  fastify.post('/ai/validate-input', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const body = ValidateInputRequestSchema.parse(request.body);
    const result = await aiClient.post('/ai/validate-input', body, request.user);
    reply.send(result);
  });

  // Generate contract content using AI + RAG
  fastify.post('/ai/generate-contract', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const body = AIGenerateRequestSchema.parse(request.body);
    const result = await aiClient.post('/ai/generate-contract', body, request.user);

    // Check if it's async (202) or sync (200)
    if (result && typeof result === 'object' && 'jobId' in result) {
      reply.status(202).send(result);
    } else {
      reply.send(result);
    }
  });

  // Regenerate contract with feedback
  fastify.post('/ai/regenerate', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const body = AIRegenerateRequestSchema.parse(request.body);
    const result = await aiClient.post('/ai/regenerate', body, request.user);
    reply.send(result);
  });

  // Poll async AI generation job status
  fastify.get('/ai/jobs/:jobId', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = JobIdParamSchema.parse(request.params);
    const status = await aiClient.get(`/ai/jobs/${params.jobId}`, undefined, request.user);
    reply.send(status);
  });
}
