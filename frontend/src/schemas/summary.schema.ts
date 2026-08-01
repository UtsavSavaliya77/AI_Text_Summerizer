import { z } from 'zod';

export const summarySchema = z.object({
  content: z.string().min(50, "Content must be at least 50 characters to summarize effectively."),
  summaryType: z.enum(['one-line', 'short', 'detailed', 'executive', 'bullet']),
  title: z.string().min(1, "Title is required"),
});

export type SummaryFormValues = z.infer<typeof summarySchema>;