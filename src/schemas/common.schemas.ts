import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(20).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'status']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

export const ContractIdParamSchema = z.object({
  contractId: z.string().min(1),
});

export const SessionIdParamSchema = z.object({
  sessionId: z.string().min(1),
});

export const TemplateIdParamSchema = z.object({
  templateId: z.string().min(1),
});

export const PartyIdParamSchema = z.object({
  contractId: z.string().min(1),
  partyId: z.string().min(1),
});

export const DocumentIdParamSchema = z.object({
  documentId: z.string().min(1),
});

export const SignatureIdParamSchema = z.object({
  signatureId: z.string().min(1),
});

export const InvitationIdParamSchema = z.object({
  invitationId: z.string().min(1),
});

export const JobIdParamSchema = z.object({
  jobId: z.string().min(1),
});

export const TypeParamSchema = z.object({
  type: z.string().min(1),
});
