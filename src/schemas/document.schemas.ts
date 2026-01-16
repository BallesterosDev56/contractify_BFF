import { z } from 'zod';

export const GeneratePDFRequestSchema = z.object({
  contractId: z.string().min(1),
  includeAuditPage: z.boolean().default(true).optional(),
});

export const DownloadDocumentQuerySchema = z.object({
  version: z.string().optional(),
});
