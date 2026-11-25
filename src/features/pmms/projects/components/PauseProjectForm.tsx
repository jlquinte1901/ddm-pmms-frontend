import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AlertCircle, Pause } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/shared/components/toast/toast-context'
import { usePauseProject } from '../hooks/usePauseProject'
import {
  pauseProjectSchema,
  type PauseProjectFormValues,
} from '../schemas/projectLifecycleSchemas'
import { ActionField } from './ActionField'
import { applyServerErrors } from './formErrors'

const selectClassName =
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30'

type PauseProjectFormProps = {
  projectId: number
  onClose: () => void
}

export function PauseProjectForm({
  projectId,
  onClose,
}: PauseProjectFormProps) {
  const toast = useToast()
  const mutation = usePauseProject()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<PauseProjectFormValues>({
    resolver: zodResolver(pauseProjectSchema),
    defaultValues: { status: 'suspended', reason: '' },
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError(null)

    try {
      await mutation.mutateAsync({
        projectId,
        payload: { status: values.status, reason: values.reason.trim() },
      })
      toast.success('Project paused', 'The project has been paused.')
      onClose()
    } catch (error) {
      applyServerErrors(form.setError, error, setServerError)
    }
  })

  const statusError = form.formState.errors.status?.message
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

      <ActionField id="status" label="Pause status" required error={statusError}>
        <select
          id="status"
          className={selectClassName}
          {...form.register('status')}
        >
          <option value="suspended">Suspended</option>
          <option value="postponed">Postponed</option>
        </select>
      </ActionField>

      <ActionField
        id="reason"
        label="Reason"
        required
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
          <Pause aria-hidden="true" />
          {mutation.isPending ? 'Pausing\u2026' : 'Confirm pause'}
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
