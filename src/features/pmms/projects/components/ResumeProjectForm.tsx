import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/shared/components/toast/toast-context'
import { useResumeProject } from '../hooks/useResumeProject'
import {
  resumeProjectSchema,
  type ResumeProjectFormValues,
} from '../schemas/projectLifecycleSchemas'
import { ActionField } from './ActionField'
import { applyServerErrors } from './formErrors'

type ResumeProjectFormProps = {
  projectId: number
  onClose: () => void
}

export function ResumeProjectForm({
  projectId,
  onClose,
}: ResumeProjectFormProps) {
  const toast = useToast()
  const mutation = useResumeProject()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<ResumeProjectFormValues>({
    resolver: zodResolver(resumeProjectSchema),
    defaultValues: { revised_finish_date: '', remarks: '' },
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError(null)

    try {
      await mutation.mutateAsync({
        projectId,
        payload: {
          revised_finish_date: values.revised_finish_date,
          remarks: values.remarks.trim(),
        },
      })
      toast.success('Project resumed', 'The project is now ongoing again.')
      onClose()
    } catch (error) {
      applyServerErrors(form.setError, error, setServerError)
    }
  })

  const dateError = form.formState.errors.revised_finish_date?.message
  const remarksError = form.formState.errors.remarks?.message

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
        id="revised_finish_date"
        label="Revised finish date"
        required
        error={dateError}
      >
        <Input
          id="revised_finish_date"
          type="date"
          aria-invalid={dateError !== undefined}
          aria-describedby={dateError ? 'revised_finish_date-error' : undefined}
          {...form.register('revised_finish_date')}
        />
      </ActionField>

      <ActionField
        id="remarks"
        label="Remarks"
        required
        error={remarksError}
      >
        <Textarea
          id="remarks"
          rows={3}
          aria-invalid={remarksError !== undefined}
          aria-describedby={remarksError ? 'remarks-error' : undefined}
          {...form.register('remarks')}
        />
      </ActionField>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={mutation.isPending}>
          <RotateCcw aria-hidden="true" />
          {mutation.isPending ? 'Resuming\u2026' : 'Confirm resume'}
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
