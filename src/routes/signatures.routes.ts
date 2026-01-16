import { FastifyInstance } from 'fastify';
import { authenticateUser, optionalAuth } from '../middlewares/auth.js';
import { signaturesClient, contractsClient } from '../services/microservice.client.js';
import {
  SignRequestSchema,
  GuestSignRequestSchema,
  CreateSignatureTokenRequestSchema,
  ValidateTokenQuerySchema,
} from '../schemas/signature.schemas.js';
import { ContractIdParamSchema, SignatureIdParamSchema } from '../schemas/common.schemas.js';

export async function signaturesRoutes(fastify: FastifyInstance): Promise<void> {
  // Create signature token for party
  fastify.post('/signatures/create-token', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const body = CreateSignatureTokenRequestSchema.parse(request.body);
    const result = await signaturesClient.post('/signatures/create-token', body, request.user);
    reply.status(201).send(result);
  });

  // Validate signature token (public endpoint)
  fastify.get('/signatures/validate-token', {
    preHandler: [],
  }, async (request, reply) => {
    const query = ValidateTokenQuerySchema.parse(request.query);
    const result = await signaturesClient.get('/signatures/validate-token', { token: query.token });
    reply.send(result);
  });

  // Sign contract (authenticated user)
  fastify.post('/signatures/sign', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const body = SignRequestSchema.parse(request.body);
    const result = await signaturesClient.post('/signatures/sign', body, request.user);
    reply.send(result);
  });

  // Sign contract as guest (public with token)
  fastify.post('/signatures/sign-guest', {
    preHandler: [],
  }, async (request, reply) => {
    const body = GuestSignRequestSchema.parse(request.body);
    const result = await signaturesClient.post('/signatures/sign-guest', body);
    reply.send(result);
  });

  // Get all signatures for contract
  fastify.get('/contracts/:contractId/signatures', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = ContractIdParamSchema.parse(request.params);
    const signatures = await contractsClient.get(`/contracts/${params.contractId}/signatures`, undefined, request.user);
    reply.send(signatures);
  });

  // Store signature evidence
  fastify.post('/signatures/:signatureId/evidence', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = SignatureIdParamSchema.parse(request.params);
    await signaturesClient.post(`/signatures/${params.signatureId}/evidence`, request.body, request.user);
    reply.status(201).send();
  });

  // Download signature certificate
  fastify.get('/signatures/:signatureId/certificate', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = SignatureIdParamSchema.parse(request.params);
    const pdfBuffer = await signaturesClient.getStream(
      `/signatures/${params.signatureId}/certificate`,
      undefined,
      request.user
    );
    reply.type('application/pdf').send(pdfBuffer);
  });
}
