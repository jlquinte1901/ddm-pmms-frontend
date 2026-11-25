import { z } from 'zod'

export function localToday(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000

  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export const startProjectSchema = z.object({
  remarks: z
    .string()
    .trim()
    .max(2000, 'Remarks must be 2000 characters or fewer.'),
})

export type StartProjectFormValues = z.infer<typeof startProjectSchema>

/**
 * The `confirm_completion` flag enforces the UI contract that reporting 100%
 * completes a project. Lowering progress requires remarks, matching the
 * backend rule.
 */
export function progressReportSchema(currentProgress: number) {
  return z
    .object({
      report_date: z
        .string()
        .trim()
        .min(1, 'Report date is required.')
        .refine(
          (value) => value <= localToday(),
          'Report date cannot be in the future.',
        ),
      progress_percentage: z
        .number('Progress is required.')
        .int('Progress must be a whole number.')
        .min(0, 'Progress must be between 0 and 100.')
        .max(100, 'Progress must be between 0 and 100.'),
      accomplishment: z
        .string()
        .trim()
        .max(10000, 'Accomplishment must be 10000 characters or fewer.'),
      remarks: z
        .string()
        .trim()
        .max(10000, 'Remarks must be 10000 characters or fewer.'),
      confirm_completion: z.boolean(),
    })
    .superRefine((values, ctx) => {
      if (
        values.progress_percentage < currentProgress &&
        values.remarks === ''
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['remarks'],
          message: 'Remarks are required when progress is lowered.',
        })
      }

      if (
        values.progress_percentage === 100 &&
        values.confirm_completion !== true
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirm_completion'],
          message: 'Confirm that 100% progress completes the project.',
        })
      }
    })
}

export type ProgressReportFormValues = z.infer<
  ReturnType<typeof progressReportSchema>
>

export const pauseProjectSchema = z.object({
  status: z.enum(['suspended', 'postponed']),
  reason: z
    .string()
    .trim()
    .min(10, 'Reason must be at least 10 characters.')
    .max(2000, 'Reason must be 2000 characters or fewer.'),
})

export type PauseProjectFormValues = z.infer<typeof pauseProjectSchema>

export const resumeProjectSchema = z.object({
  revised_finish_date: z
    .string()
    .trim()
    .min(1, 'Revised finish date is required.')
    .refine(
      (value) => value >= localToday(),
      'Revised finish date cannot be before today.',
    ),
  remarks: z
    .string()
    .trim()
    .min(1, 'Remarks are required.')
    .max(2000, 'Remarks must be 2000 characters or fewer.'),
})

export type ResumeProjectFormValues = z.infer<typeof resumeProjectSchema>
