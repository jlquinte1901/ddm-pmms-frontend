import { z } from 'zod'

const reason = z
  .string()
  .trim()
  .min(1, 'Reason is required.')
  .max(2000, 'Reason must be 2000 characters or fewer.')

export const terminateProjectSchema = z.object({ reason })

export type TerminateProjectFormValues = z.infer<
  typeof terminateProjectSchema
>

export const reopenProjectSchema = z.object({
  reason,
  progress_percentage: z
    .number('Progress is required.')
    .int('Progress must be a whole number.')
    .min(0, 'Progress must be between 0 and 99.')
    .max(99, 'Progress must be between 0 and 99.'),
})

export type ReopenProjectFormValues = z.infer<typeof reopenProjectSchema>

export const reassignProjectSchema = z.object({
  assigned_pe_id: z.string().trim().min(1, 'Select a Project Engineer.'),
  reason,
})

export type ReassignProjectFormValues = z.infer<typeof reassignProjectSchema>

export const deleteProjectSchema = z.object({ reason })

export type DeleteProjectFormValues = z.infer<typeof deleteProjectSchema>

export const correctPlannedDatesSchema = z
  .object({
    planned_start_date: z
      .string()
      .trim()
      .min(1, 'Planned start date is required.'),
    planned_finish_date: z
      .string()
      .trim()
      .min(1, 'Planned finish date is required.'),
    reason,
  })
  .superRefine((values, ctx) => {
    if (
      values.planned_start_date !== '' &&
      values.planned_finish_date !== '' &&
      values.planned_finish_date < values.planned_start_date
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['planned_finish_date'],
        message: 'Planned finish date cannot be before the planned start date.',
      })
    }
  })

export type CorrectPlannedDatesFormValues = z.infer<
  typeof correctPlannedDatesSchema
>
