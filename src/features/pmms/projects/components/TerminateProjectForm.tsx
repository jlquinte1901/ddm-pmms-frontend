import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AlertCircle, Ban } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/shared/components/toast/toast-context'
import { useTerminateProject } from '../hooks/useTerminateProject'
import {
  terminateProjectSchema,
  type TerminateProjectFormValues,
} from '../schemas/projectAdminSchemas'
import { ActionField } from './ActionField'
import { applyServerErrors } from './formErrors'

type TerminateProjectFormProps = {
  projectId: number
  onClose: () => void
}

export function TerminateProjectForm({
  projectId,
  onClose,
}: TerminateProjectFormProps) {
  const toast = useToast()
  const mutation = useTerminateProject()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<TerminateProjectFormValues>({
    resolver: zodResolver(terminateProjectSchema),
    defaultValues: { reason: '' },
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError(null)

    try {
      await mutation.mutateAsync({
        projectId,
        payload: { reason: values.reason.trim() },
      })
      toast.success('Project terminated', 'The project has been terminated.')
      onClose()
    } catch (error) {
      applyServerErrors(form.setError, error, setServerError)
    }
  })

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
        <Button type="submit" variant="destructive" disabled={mutation.isPending}>
          <Ban aria-hidden="true" />
          {mutation.isPending ? 'Terminating\u2026' : 'Confirm terminate'}
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
