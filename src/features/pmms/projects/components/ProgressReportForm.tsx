import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { AlertCircle, TrendingUp } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/shared/components/toast/toast-context'
import { useReportProgress } from '../hooks/useReportProgress'
import {
  localToday,
  progressReportSchema,
  type ProgressReportFormValues,
} from '../schemas/projectLifecycleSchemas'
import { ActionField } from './ActionField'
import { applyServerErrors } from './formErrors'

type ProgressReportFormProps = {
  projectId: number
  currentProgress: number
  onClose: () => void
}

export function ProgressReportForm({
  projectId,
  currentProgress,
  onClose,
}: ProgressReportFormProps) {
  const toast = useToast()
  const mutation = useReportProgress()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<ProgressReportFormValues>({
    resolver: zodResolver(progressReportSchema(currentProgress)),
    defaultValues: {
      report_date: localToday(),
      progress_percentage: currentProgress,
      accomplishment: '',
      remarks: '',
      confirm_completion: false,
    },
  })

  const progress = useWatch({
    control: form.control,
    name: 'progress_percentage',
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError(null)

    try {
      await mutation.mutateAsync({
        projectId,
        payload: {
          report_date: values.report_date,
          progress_percentage: values.progress_percentage,
          accomplishment:
            values.accomplishment.trim() === ''
              ? null
              : values.accomplishment.trim(),
          remarks: values.remarks.trim() === '' ? null : values.remarks.trim(),
        },
      })
      toast.success('Progress reported', 'The progress update has been recorded.')
      onClose()
    } catch (error) {
      applyServerErrors(form.setError, error, setServerError)
    }
  })

  function fieldError(name: keyof ProgressReportFormValues): string | undefined {
    return form.formState.errors[name]?.message
  }

  function ariaProps(name: keyof ProgressReportFormValues) {
    const error = fieldError(name)

    return {
      'aria-invalid': error !== undefined,
      'aria-describedby': error ? `${name}-error` : undefined,
    } as const
  }

  const confirmError = fieldError('confirm_completion')

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
          id="report_date"
          label="Report date"
          required
          error={fieldError('report_date')}
        >
          <Input
            id="report_date"
            type="date"
            {...ariaProps('report_date')}
            {...form.register('report_date')}
          />
        </ActionField>

        <ActionField
          id="progress_percentage"
          label="Progress percentage"
          required
          error={fieldError('progress_percentage')}
        >
          <Input
            id="progress_percentage"
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            {...ariaProps('progress_percentage')}
            {...form.register('progress_percentage', { valueAsNumber: true })}
          />
        </ActionField>
      </div>

      <ActionField
        id="accomplishment"
        label="Accomplishment"
        error={fieldError('accomplishment')}
      >
        <Textarea
          id="accomplishment"
          rows={2}
          {...ariaProps('accomplishment')}
          {...form.register('accomplishment')}
        />
      </ActionField>

      <ActionField
        id="remarks"
        label="Remarks"
        error={fieldError('remarks')}
      >
        <Textarea
          id="remarks"
          rows={2}
          {...ariaProps('remarks')}
          {...form.register('remarks')}
        />
      </ActionField>

      {progress === 100 ? (
        <div className="space-y-1.5">
          <label className="flex items-start gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              className="mt-0.5"
              aria-describedby={
                confirmError ? 'confirm_completion-error' : undefined
              }
              {...form.register('confirm_completion')}
            />
            <span>
              I understand that reporting 100% progress completes this project.
            </span>
          </label>
          {confirmError ? (
            <p
              id="confirm_completion-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {confirmError}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={mutation.isPending}>
          <TrendingUp aria-hidden="true" />
          {mutation.isPending ? 'Saving\u2026' : 'Save progress'}
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
