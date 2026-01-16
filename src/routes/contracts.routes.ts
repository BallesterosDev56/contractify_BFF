import { FastifyInstance } from 'fastify';
import { authenticateUser, optionalAuth } from '../middlewares/auth.js';
import { contractsClient } from '../services/microservice.client.js';
import {
  CreateContractRequestSchema,
  UpdateContractRequestSchema,
  UpdateContractContentRequestSchema,
  UpdateContractStatusRequestSchema,
  ContractFiltersSchema,
  BulkDownloadRequestSchema,
  PublicContractQuerySchema,
} from '../schemas/contract.schemas.js';
import {
  ContractIdParamSchema,
  PartyIdParamSchema,
  TypeParamSchema,
} from '../schemas/common.schemas.js';
import { AddPartyRequestSchema } from '../schemas/party.schemas.js';

export async function contractsRoutes(fastify: FastifyInstance): Promise<void> {
  // List contracts with filters and pagination
  fastify.get('/contracts', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const query = ContractFiltersSchema.parse(request.query);
    const contracts = await contractsClient.get('/contracts', query, request.user);
    reply.send(contracts);
  });

  // Create new contract
  fastify.post('/contracts', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const body = CreateContractRequestSchema.parse(request.body);
    const contract = await contractsClient.post('/contracts', body, request.user);
    reply.status(201).send(contract);
  });

  // Get contract statistics
  fastify.get('/contracts/stats', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const stats = await contractsClient.get('/contracts/stats', undefined, request.user);
    reply.send(stats);
  });

  // Get recent contracts
  fastify.get('/contracts/recent', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const contracts = await contractsClient.get('/contracts/recent', undefined, request.user);
    reply.send(contracts);
  });

  // Get pending contracts
  fastify.get('/contracts/pending', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const contracts = await contractsClient.get('/contracts/pending', undefined, request.user);
    reply.send(contracts);
  });

  // Get contract details
  fastify.get('/contracts/:contractId', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = ContractIdParamSchema.parse(request.params);
    const contract = await contractsClient.get(`/contracts/${params.contractId}`, undefined, request.user);
    reply.send(contract);
  });

  // Update contract metadata
  fastify.patch('/contracts/:contractId', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = ContractIdParamSchema.parse(request.params);
    const body = UpdateContractRequestSchema.parse(request.body);
    const contract = await contractsClient.patch(`/contracts/${params.contractId}`, body, request.user);
    reply.send(contract);
  });

  // Delete contract
  fastify.delete('/contracts/:contractId', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = ContractIdParamSchema.parse(request.params);
    await contractsClient.delete(`/contracts/${params.contractId}`, request.user);
    reply.status(204).send();
  });

  // Duplicate contract
  fastify.post('/contracts/:contractId/duplicate', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = ContractIdParamSchema.parse(request.params);
    const contract = await contractsClient.post(`/contracts/${params.contractId}/duplicate`, undefined, request.user);
    reply.status(201).send(contract);
  });

  // Update contract content
  fastify.patch('/contracts/:contractId/content', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = ContractIdParamSchema.parse(request.params);
    const body = UpdateContractContentRequestSchema.parse(request.body);
    await contractsClient.patch(`/contracts/${params.contractId}/content`, body, request.user);
    reply.status(200).send();
  });

  // Get contract version history
  fastify.get('/contracts/:contractId/versions', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = ContractIdParamSchema.parse(request.params);
    const versions = await contractsClient.get(`/contracts/${params.contractId}/versions`, undefined, request.user);
    reply.send(versions);
  });

  // Update contract status
  fastify.patch('/contracts/:contractId/status', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = ContractIdParamSchema.parse(request.params);
    const body = UpdateContractStatusRequestSchema.parse(request.body);
    await contractsClient.patch(`/contracts/${params.contractId}/status`, body, request.user);
    reply.status(200).send();
  });

  // Get valid status transitions
  fastify.get('/contracts/:contractId/transitions', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = ContractIdParamSchema.parse(request.params);
    const transitions = await contractsClient.get(`/contracts/${params.contractId}/transitions`, undefined, request.user);
    reply.send(transitions);
  });

  // Get contract activity history
  fastify.get('/contracts/:contractId/history', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = ContractIdParamSchema.parse(request.params);
    const history = await contractsClient.get(`/contracts/${params.contractId}/history`, undefined, request.user);
    reply.send(history);
  });

  // Get contract parties
  fastify.get('/contracts/:contractId/parties', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = ContractIdParamSchema.parse(request.params);
    const parties = await contractsClient.get(`/contracts/${params.contractId}/parties`, undefined, request.user);
    reply.send(parties);
  });

  // Add party to contract
  fastify.post('/contracts/:contractId/parties', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = ContractIdParamSchema.parse(request.params);
    const body = AddPartyRequestSchema.parse(request.body);
    await contractsClient.post(`/contracts/${params.contractId}/parties`, body, request.user);
    reply.status(201).send();
  });

  // Remove party from contract
  fastify.delete('/contracts/:contractId/parties/:partyId', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = PartyIdParamSchema.parse(request.params);
    await contractsClient.delete(`/contracts/${params.contractId}/parties/${params.partyId}`, request.user);
    reply.status(204).send();
  });

  // Bulk download contracts
  fastify.post('/contracts/bulk-download', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const body = BulkDownloadRequestSchema.parse(request.body);
    const zipBuffer = await contractsClient.postStream('/contracts/bulk-download', body, request.user);
    reply.type('application/zip').send(zipBuffer);
  });

  // Get public contract view (for guest signing)
  fastify.get('/contracts/:contractId/public', {
    preHandler: [optionalAuth],
  }, async (request, reply) => {
    const params = ContractIdParamSchema.parse(request.params);
    const query = PublicContractQuerySchema.parse(request.query);
    const contract = await contractsClient.get(
      `/contracts/${params.contractId}/public`,
      { token: query.token },
      request.user
    );
    reply.send(contract);
  });
}
