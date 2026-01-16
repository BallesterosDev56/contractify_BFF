import { z } from 'zod';

export const SignatureEvidenceSchema = z.object({
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  geolocation: z.string().optional(),
  signedAt: z.string().datetime().optional(),
});

export const SignRequestSchema = z.object({
  contractId: z.string().min(1),
  partyId: z.string().min(1),
  evidence: SignatureEvidenceSchema.optional(),
});

export const GuestSignRequestSchema = z.object({
  token: z.string().min(1),
  evidence: SignatureEvidenceSchema.optional(),
});

export const CreateSignatureTokenRequestSchema = z.object({
  contractId: z.string().min(1),
  partyId: z.string().min(1),
  expiresInMinutes: z.number().int().positive().default(1440).optional(),
});

export const ValidateTokenQuerySchema = z.object({
  token: z.string().min(1),
});
