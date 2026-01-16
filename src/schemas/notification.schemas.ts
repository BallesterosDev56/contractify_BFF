import { z } from 'zod';

export const SendInvitationRequestSchema = z.object({
  contractId: z.string().min(1),
  partyId: z.string().min(1),
  message: z.string().optional(),
});

export const ScheduleReminderRequestSchema = z.object({
  contractId: z.string().min(1),
  partyId: z.string().min(1),
  scheduleAt: z.string().datetime(),
});
