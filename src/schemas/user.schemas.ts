import { z } from 'zod';

export const UpdateUserRequestSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const UpdatePreferencesRequestSchema = z.record(z.unknown());
