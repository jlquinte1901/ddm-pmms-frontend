import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AlertCircle, CheckCircle2, KeyRound } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/shared/components/PageHeader'
import { useToast } from '@/shared/components/toast/toast-context'
import { applyServerErrors } from '@/shared/lib/applyServerErrors'
import { useChangePassword } from '../hooks/useChangePassword'
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '../schemas/changePasswordSchema'

type FieldName = keyof ChangePasswordFormValues

export function ChangePasswordPage() {
  const toast = useToast()
  const mutation = useChangePassword()
  const [serverError, setServerError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError(null)
    setNotice(null)

    try {
      await mutation.mutateAsync(values)
      form.reset()
      setNotice(
        'Your password has been changed. All other sessions have been signed out.',
      )
      toast.success('Password changed')
    } catch (error) {
      applyServerErrors(form.setError, error, setServerError)
    }
  })

  function fieldError(name: FieldName): string | undefined {
    return form.formState.errors[name]?.message
  }

  function fieldProps(name: FieldName) {
    const error = fieldError(name)

    return {
      'aria-invalid': error !== undefined,
      'aria-describedby': error ? `${name}-error` : undefined,
    } as const
  }

  function errorText(name: FieldName) {
    const error = fieldError(name)

    return error ? (
      <p id={`${name}-error`} role="alert" className="text-sm text-destructive">
        {error}
      </p>
    ) : null
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Change password"
        description="Update your sign-in password. Other active sessions are signed out after a successful change."
      />

      <div className="max-w-xl space-y-4 rounded-xl border bg-card p-4 sm:p-5">
        {notice ? (
          <Alert>
            <CheckCircle2 aria-hidden="true" />
            <AlertTitle>{notice}</AlertTitle>
          </Alert>
        ) : null}

        {serverError ? (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>{serverError}</AlertTitle>
          </Alert>
        ) : null}

        <form noValidate onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current_password">Current password</Label>
            <Input
              id="current_password"
              type="password"
              autoComplete="current-password"
              {...fieldProps('current_password')}
              {...form.register('current_password')}
            />
            {errorText('current_password')}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...fieldProps('password')}
              {...form.register('password')}
            />
            {errorText('password') ?? (
              <p className="text-xs text-muted-foreground">
                At least 12 characters.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password_confirmation">Confirm new password</Label>
            <Input
              id="password_confirmation"
              type="password"
              autoComplete="new-password"
              {...fieldProps('password_confirmation')}
              {...form.register('password_confirmation')}
            />
            {errorText('password_confirmation')}
          </div>

          <Button type="submit" disabled={mutation.isPending}>
            <KeyRound aria-hidden="true" />
            {mutation.isPending ? 'Saving\u2026' : 'Change password'}
          </Button>
        </form>
      </div>
    </div>
  )
}
