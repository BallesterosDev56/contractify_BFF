import { z } from 'zod';

export const PartyRoleSchema = z.enum(['HOST', 'GUEST', 'WITNESS']);

export const SignatureStatusSchema = z.enum(['PENDING', 'INVITED', 'SIGNED']);

export const AddPartyRequestSchema = z.object({
  role: PartyRoleSchema,
  name: z.string().min(1),
  email: z.string().email(),
  order: z.number().int().positive().optional(),
});
