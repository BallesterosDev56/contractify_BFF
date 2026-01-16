import { FastifyInstance } from 'fastify';
import { authenticateUser } from '../middlewares/auth.js';
import { documentsClient } from '../services/microservice.client.js';
import { GeneratePDFRequestSchema, DownloadDocumentQuerySchema } from '../schemas/document.schemas.js';
import { DocumentIdParamSchema, JobIdParamSchema } from '../schemas/common.schemas.js';

export async function documentsRoutes(fastify: FastifyInstance): Promise<void> {
  // Generate PDF from contract content
  fastify.post('/documents/generate-pdf', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const body = GeneratePDFRequestSchema.parse(request.body);
    const result = await documentsClient.post('/documents/generate-pdf', body, request.user);
    reply.status(202).send(result);
  });

  // Download contract PDF
  fastify.get('/documents/:documentId/download', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = DocumentIdParamSchema.parse(request.params);
    const query = DownloadDocumentQuerySchema.parse(request.query);
    const pdfBuffer = await documentsClient.getStream(
      `/documents/${params.documentId}/download`,
      query,
      request.user
    );
    reply.type('application/pdf').send(pdfBuffer);
  });

  // Verify PDF integrity and signatures
  fastify.post('/documents/:documentId/verify', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = DocumentIdParamSchema.parse(request.params);
    const result = await documentsClient.post(`/documents/${params.documentId}/verify`, undefined, request.user);
    reply.send(result);
  });

  // Poll PDF generation job status
  fastify.get('/documents/jobs/:jobId', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const params = JobIdParamSchema.parse(request.params);
    const status = await documentsClient.get(`/documents/jobs/${params.jobId}`, undefined, request.user);
    reply.send(status);
  });
}
