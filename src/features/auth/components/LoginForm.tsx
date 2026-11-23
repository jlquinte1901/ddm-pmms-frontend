import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError, getErrorMessage } from '@/shared/api/errors'
import { fetchCurrentUser, loginRequest } from '@/shared/auth/api'
import { useAuthStore } from '@/shared/auth/authStore'
import { getLandingPath } from '@/shared/auth/landing'
import { authKeys } from '@/shared/auth/queryKeys'
import type { AuthUser } from '@/shared/types/api'
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema'

type LoginLocationState = {
  from?: string
}

function safeRedirectPath(from: unknown): string | null {
  return typeof from === 'string' &&
    from.startsWith('/') &&
    !from.startsWith('//')
    ? from
    : null
}

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const setToken = useAuthStore((state) => state.setToken)
  const clearSession = useAuthStore((state) => state.clearSession)
  const sessionExpired = useAuthStore((state) => state.sessionExpired)
  const dismissSessionExpired = useAuthStore(
    (state) => state.dismissSessionExpired,
  )
  const [serverError, setServerError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginMutation = useMutation<AuthUser, unknown, LoginFormValues>({
    mutationFn: async (values) => {
      const response = await loginRequest(values)
      setToken(response.token)

      try {
        return await queryClient.fetchQuery({
          queryKey: authKeys.me,
          queryFn: fetchCurrentUser,
          staleTime: 0,
        })
      } catch (error) {
        clearSession('logout')
        throw error
      }
    },
  })

  useEffect(() => {
    if (cooldown <= 0) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setCooldown((current) => Math.max(0, current - 1))
    }, 1_000)

    return () => window.clearTimeout(timer)
  }, [cooldown])

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null)

    try {
      const currentUser = await loginMutation.mutateAsync(values)
      const from = safeRedirectPath(
        (location.state as LoginLocationState | null)?.from,
      )
      const permissions = currentUser.permissions.map(
        (permission) => permission.name,
      )

      navigate(from ?? getLandingPath(permissions), { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 422) {
          form.setError('email', {
            type: 'server',
            message: error.fieldError('email') ?? 'Check your email and password.',
          })
          setServerError('The email or password is incorrect.')
          return
        }

        if (error.status === 429) {
          setCooldown(30)
          setServerError(
            'Too many sign-in attempts. Please wait before trying again.',
          )
          return
        }

        setServerError(error.message)
        return
      }

      setServerError(getErrorMessage(error))
    }
  })

  const isSubmitting = loginMutation.isPending || cooldown > 0
  const emailError = form.formState.errors.email
  const passwordError = form.formState.errors.password

  return (
    <div className="space-y-4">
      {sessionExpired ? (
        <Alert>
          <AlertCircle aria-hidden="true" />
          <AlertTitle>Your session expired. Sign in again.</AlertTitle>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="justify-self-start"
            onClick={dismissSessionExpired}
          >
            Dismiss
          </Button>
        </Alert>
      ) : null}

      {serverError ? (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>{serverError}</AlertTitle>
        </Alert>
      ) : null}

      <form noValidate onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <div className="relative">
            <Mail
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              placeholder="Enter your email"
              className="h-10 pr-3 pl-11 text-base placeholder:text-lg lg:text-base"
              aria-invalid={emailError !== undefined}
              aria-describedby={emailError ? 'email-error' : undefined}
              {...form.register('email', {
                onChange: () => setServerError(null),
              })}
            />
          </div>
          {emailError ? (
            <p id="email-error" role="alert" className="text-sm text-destructive">
              {emailError.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="sr-only">
            Password
          </Label>
          <div className="relative">
            <Lock
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="h-10 pr-12 pl-11 text-base placeholder:text-lg lg:text-base"
              aria-invalid={passwordError !== undefined}
              aria-describedby={passwordError ? 'password-error' : undefined}
              {...form.register('password', {
                onChange: () => setServerError(null),
              })}
            />
            <button
              type="button"
              className="absolute top-1/2 right-1.5 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="size-4" />
              ) : (
                <Eye aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>
          {passwordError ? (
            <p
              id="password-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {passwordError.message}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          className="h-11 w-full"
          disabled={isSubmitting}
        >
          <LogIn aria-hidden="true" />
          {loginMutation.isPending
            ? 'Signing in\u2026'
            : cooldown > 0
              ? `Try again in ${cooldown}s`
              : 'Sign in'}
        </Button>
      </form>
    </div>
  )
}
