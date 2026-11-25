import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AlertCircle, Play } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/shared/components/toast/toast-context'
import { useStartProject } from '../hooks/useStartProject'
import {
  startProjectSchema,
  type StartProjectFormValues,
} from '../schemas/projectLifecycleSchemas'
import { ActionField } from './ActionField'
import { applyServerErrors } from './formErrors'

type StartProjectFormProps = {
  projectId: number
  onClose: () => void
}

export function StartProjectForm({
  projectId,
  onClose,
}: StartProjectFormProps) {
  const toast = useToast()
  const mutation = useStartProject()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<StartProjectFormValues>({
    resolver: zodResolver(startProjectSchema),
    defaultValues: { remarks: '' },
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError(null)

    try {
      await mutation.mutateAsync({
        projectId,
        payload: {
          remarks: values.remarks.trim() === '' ? null : values.remarks.trim(),
        },
      })
      toast.success('Project started', 'The project is now ongoing.')
      onClose()
    } catch (error) {
      applyServerErrors(form.setError, error, setServerError)
    }
  })

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

      <ActionField id="remarks" label="Remarks" error={remarksError}>
        <Textarea id="remarks" rows={2} {...form.register('remarks')} />
      </ActionField>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={mutation.isPending}>
          <Play aria-hidden="true" />
          Confirm start
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
