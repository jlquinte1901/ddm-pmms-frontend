import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AlertCircle, UserRoundCog } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { LoadingState } from '@/shared/components/states'
import { useToast } from '@/shared/components/toast/toast-context'
import { useAssignableEngineers } from '../hooks/useAssignableEngineers'
import { useReassignProject } from '../hooks/useReassignProject'
import {
  reassignProjectSchema,
  type ReassignProjectFormValues,
} from '../schemas/projectAdminSchemas'
import { ActionField } from './ActionField'
import { applyServerErrors } from './formErrors'

const selectClassName =
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30'

type ReassignProjectFormProps = {
  projectId: number
  onClose: () => void
}

export function ReassignProjectForm({
  projectId,
  onClose,
}: ReassignProjectFormProps) {
  const toast = useToast()
  const mutation = useReassignProject()
  const engineersQuery = useAssignableEngineers()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<ReassignProjectFormValues>({
    resolver: zodResolver(reassignProjectSchema),
    defaultValues: { assigned_pe_id: '', reason: '' },
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError(null)

    try {
      await mutation.mutateAsync({
        projectId,
        payload: {
          assigned_pe_id: Number(values.assigned_pe_id),
          reason: values.reason.trim(),
        },
      })
      toast.success(
        'Project reassigned',
        'The project has a new Project Engineer.',
      )
      onClose()
    } catch (error) {
      applyServerErrors(form.setError, error, setServerError)
    }
  })

  const engineerError = form.formState.errors.assigned_pe_id?.message
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
        id="assigned_pe_id"
        label="Project Engineer"
        required
        error={engineerError}
      >
        {engineersQuery.isPending ? (
          <LoadingState variant="inline" label="Loading Project Engineers" />
        ) : (
          <select
            id="assigned_pe_id"
            className={selectClassName}
            aria-invalid={engineerError !== undefined}
            aria-describedby={engineerError ? 'assigned_pe_id-error' : undefined}
            {...form.register('assigned_pe_id')}
          >
            <option value="">Select a Project Engineer</option>
            {(engineersQuery.data ?? []).map((engineer) => (
              <option key={engineer.id} value={engineer.id}>
                {engineer.full_name}
              </option>
            ))}
          </select>
        )}
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
          <UserRoundCog aria-hidden="true" />
          {mutation.isPending ? 'Reassigning\u2026' : 'Confirm reassign'}
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
