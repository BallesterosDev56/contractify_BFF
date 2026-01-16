import { z } from 'zod';

export const TemplateFiltersSchema = z.object({
  category: z.string().optional(),
  jurisdiction: z.string().optional(),
});
