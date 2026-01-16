import { FastifyInstance } from 'fastify';
import { authenticateUser } from '../middlewares/auth.js';
import { auditClient } from '../services/microservice.client.js';
import { ContractIdParamSchema } from '../schemas/common.schemas.js';

export async function auditRoutes(fastify: FastifyInstance): Promise<void> {
  // Get complete audit trail for contract
  fastify.get('/audit/contracts/:contractId/trail', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = ContractIdParamSchema.parse(request.params);
    const trail = await auditClient.get(`/audit/contracts/${params.contractId}/trail`, undefined, request.user);
    reply.send(trail);
  });

  // Export audit trail as PDF
  fastify.get('/audit/contracts/:contractId/export', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = ContractIdParamSchema.parse(request.params);
    const pdfBuffer = await auditClient.getStream(
      `/audit/contracts/${params.contractId}/export`,
      undefined,
      request.user
    );
    reply.type('application/pdf').send(pdfBuffer);
  });
}
