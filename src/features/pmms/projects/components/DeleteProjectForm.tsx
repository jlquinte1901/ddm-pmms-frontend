import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AlertCircle, Trash2 } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/shared/components/toast/toast-context'
import { useDeleteProject } from '../hooks/useDeleteProject'
import {
  deleteProjectSchema,
  type DeleteProjectFormValues,
} from '../schemas/projectAdminSchemas'
import { ActionField } from './ActionField'
import { applyServerErrors } from './formErrors'

type DeleteProjectFormProps = {
  projectId: number
  onCancel: () => void
  onDeleted: () => void
}

export function DeleteProjectForm({
  projectId,
  onCancel,
  onDeleted,
}: DeleteProjectFormProps) {
  const toast = useToast()
  const mutation = useDeleteProject()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<DeleteProjectFormValues>({
    resolver: zodResolver(deleteProjectSchema),
    defaultValues: { reason: '' },
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError(null)

    try {
      await mutation.mutateAsync({
        projectId,
        payload: { reason: values.reason.trim() },
      })
      toast.success('Project deleted', 'The project has been soft-deleted.')
      onDeleted()
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

      <ActionField
        id="reason"
        label="Reason"
        required
        hint="This soft-deletes the project; its history is preserved."
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
        <Button type="submit" variant="destructive" disabled={mutation.isPending}>
          <Trash2 aria-hidden="true" />
          {mutation.isPending ? 'Deleting\u2026' : 'Delete project'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={mutation.isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
