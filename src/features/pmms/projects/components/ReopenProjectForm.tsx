import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AlertCircle, Undo2 } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/shared/components/toast/toast-context'
import { useReopenProject } from '../hooks/useReopenProject'
import {
  reopenProjectSchema,
  type ReopenProjectFormValues,
} from '../schemas/projectAdminSchemas'
import { ActionField } from './ActionField'
import { applyServerErrors } from './formErrors'

type ReopenProjectFormProps = {
  projectId: number
  onClose: () => void
}

export function ReopenProjectForm({
  projectId,
  onClose,
}: ReopenProjectFormProps) {
  const toast = useToast()
  const mutation = useReopenProject()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<ReopenProjectFormValues>({
    resolver: zodResolver(reopenProjectSchema),
    defaultValues: { reason: '', progress_percentage: 0 },
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError(null)

    try {
      await mutation.mutateAsync({
        projectId,
        payload: {
          reason: values.reason.trim(),
          progress_percentage: values.progress_percentage,
        },
      })
      toast.success('Project reopened', 'The project is now ongoing.')
      onClose()
    } catch (error) {
      applyServerErrors(form.setError, error, setServerError)
    }
  })

  const reasonError = form.formState.errors.reason?.message
  const progressError = form.formState.errors.progress_percentage?.message

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

      <ActionField
        id="progress_percentage"
        label="Progress percentage"
        required
        error={progressError}
      >
        <Input
          id="progress_percentage"
          type="number"
          inputMode="numeric"
          min={0}
          max={99}
          aria-invalid={progressError !== undefined}
          aria-describedby={
            progressError ? 'progress_percentage-error' : undefined
          }
          {...form.register('progress_percentage', { valueAsNumber: true })}
        />
      </ActionField>

      <ActionField id="reason" label="Reason" required error={reasonError}>
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
          <Undo2 aria-hidden="true" />
          {mutation.isPending ? 'Reopening\u2026' : 'Confirm reopen'}
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
