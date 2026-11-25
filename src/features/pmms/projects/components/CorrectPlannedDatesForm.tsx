import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AlertCircle, CalendarClock } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/shared/components/toast/toast-context'
import { useCorrectPlannedDates } from '../hooks/useCorrectPlannedDates'
import {
  correctPlannedDatesSchema,
  type CorrectPlannedDatesFormValues,
} from '../schemas/projectAdminSchemas'
import { ActionField } from './ActionField'
import { applyServerErrors } from './formErrors'

type CorrectPlannedDatesFormProps = {
  projectId: number
  initialStart: string | null
  initialFinish: string | null
  onClose: () => void
}

export function CorrectPlannedDatesForm({
  projectId,
  initialStart,
  initialFinish,
  onClose,
}: CorrectPlannedDatesFormProps) {
  const toast = useToast()
  const mutation = useCorrectPlannedDates()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<CorrectPlannedDatesFormValues>({
    resolver: zodResolver(correctPlannedDatesSchema),
    defaultValues: {
      planned_start_date: initialStart ?? '',
      planned_finish_date: initialFinish ?? '',
      reason: '',
    },
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError(null)

    try {
      await mutation.mutateAsync({
        projectId,
        payload: {
          planned_start_date: values.planned_start_date,
          planned_finish_date: values.planned_finish_date,
          reason: values.reason.trim(),
        },
      })
      toast.success('Planned dates corrected', 'The schedule has been updated.')
      onClose()
    } catch (error) {
      applyServerErrors(form.setError, error, setServerError)
    }
  })

  const startError = form.formState.errors.planned_start_date?.message
  const finishError = form.formState.errors.planned_finish_date?.message
  const reasonError = form.formState.errors.reason?.message

  return (
    <form
      noValidate
      onSubmit={submit}
      className="mt-4 space-y-3 rounded-lg border bg-muted/30 p-3"
    >
      {serverError ? (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>{serverError}</AlertTitle>
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <ActionField
          id="planned_start_date"
          label="Planned start date"
          required
          error={startError}
        >
          <Input
            id="planned_start_date"
            type="date"
            aria-invalid={startError !== undefined}
            aria-describedby={startError ? 'planned_start_date-error' : undefined}
            {...form.register('planned_start_date')}
          />
        </ActionField>

        <ActionField
          id="planned_finish_date"
          label="Planned finish date"
          required
          error={finishError}
        >
          <Input
            id="planned_finish_date"
            type="date"
            aria-invalid={finishError !== undefined}
            aria-describedby={
              finishError ? 'planned_finish_date-error' : undefined
            }
            {...form.register('planned_finish_date')}
          />
        </ActionField>
      </div>

      <ActionField
        id="reason"
        label="Reason"
        required
        hint="Recorded in the project history and audit trail."
        error={reasonError}
      >
        <Textarea
          id="reason"
          rows={3}
          aria-invalid={reasonError !== undefined}
          aria-describedby={reasonError ? 'reason-error' : undefined}
          {...form.register('reason')}
        />
      </ActionField>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={mutation.isPending}>
          <CalendarClock aria-hidden="true" />
          {mutation.isPending ? 'Saving\u2026' : 'Confirm correction'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={mutation.isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
