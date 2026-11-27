import { z } from 'zod'

export const downloadRequestSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, 'Reason must be at least 10 characters.')
    .max(2000, 'Reason must be 2000 characters or fewer.'),
})

export type DownloadRequestFormValues = z.infer<typeof downloadRequestSchema>
