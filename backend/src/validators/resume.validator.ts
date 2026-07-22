import { z } from 'zod';

export const updateResumeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100).optional(),
  rawText: z.string().min(50, 'Resume text must be at least 50 characters').optional(),
  isPrimary: z.boolean().optional(),
});

export const uploadResumeSchema = z.object({
  title: z.string().min(1).max(100).optional(),
});

export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
