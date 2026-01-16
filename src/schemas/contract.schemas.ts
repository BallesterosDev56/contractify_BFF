import { z } from 'zod';

export const ContractStatusSchema = z.enum([
  'DRAFT',
  'GENERATED',
  'SIGNING',
  'SIGNED',
  'CANCELLED',
  'EXPIRED',
]);

export const CreateContractRequestSchema = z.object({
  title: z.string().min(1),
  templateId: z.string().min(1),
  contractType: z.string().min(1),
});

export const UpdateContractRequestSchema = z.object({
  title: z.string().optional(),
});

export const UpdateContractContentRequestSchema = z.object({
  content: z.string(),
  source: z.enum(['AI', 'USER']),
});

export const UpdateContractStatusRequestSchema = z.object({
  status: ContractStatusSchema,
  reason: z.string().optional(),
});

export const ContractFiltersSchema = z.object({
  status: ContractStatusSchema.optional(),
  search: z.string().optional(),
  templateId: z.string().optional(),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(20).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'status']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

export const BulkDownloadRequestSchema = z.object({
  contractIds: z.array(z.string()).min(1),
});

export const PublicContractQuerySchema = z.object({
  token: z.string().min(1),
});
