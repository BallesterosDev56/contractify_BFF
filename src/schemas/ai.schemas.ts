import { z } from 'zod';

export const AIGenerateRequestSchema = z.object({
  contractId: z.string().min(1),
  templateId: z.string().min(1),
  contractType: z.string().min(1),
  jurisdiction: z.string().default('CO').optional(),
  inputs: z.record(z.unknown()).optional(),
});

export const AIRegenerateRequestSchema = z.object({
  contractId: z.string().min(1),
  feedback: z.string().min(1),
  preserveStructure: z.boolean().default(true).optional(),
});

export const ValidateInputRequestSchema = z.object({
  contractType: z.string().min(1),
  inputs: z.record(z.unknown()),
});
