import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/shared/auth/authStore'
import { makeRole, makeUser } from '@/test/fixtures'
import {
  authMeHandler,
  loginErrorHandler,
  loginSuccessHandler,
} from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'
import { LoginPage } from './LoginPage'

function renderLogin() {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/pmms/dashboard" element={<div>Dashboard landing</div>} />
      <Route path="/ddm/documents" element={<div>Documents landing</div>} />
      <Route path="/no-access" element={<div>No access landing</div>} />
    </Routes>,
    { route: '/login' },
  )
}

async function submitCredentials() {
  const user = userEvent.setup()

  await user.type(screen.getByLabelText('Email'), 'admin@example.com')
  await user.type(screen.getByLabelText('Password'), 'password1234')
  await user.click(screen.getByRole('button', { name: 'Sign in' }))

  return user
}

describe('LoginPage', () => {
  it('signs in, stores the token in sessionStorage, and lands by permission', async () => {
    const user = makeUser({
      role: makeRole('admin', 'Admin'),
      permissions: ['pmms.dashboard.view'],
    })

    server.use(
      loginSuccessHandler(user),
      authMeHandler(user),
    )

    renderLogin()
    await submitCredentials()

    expect(await screen.findByText('Dashboard landing')).toBeInTheDocument()
    expect(useAuthStore.getState().token).toBe('test-token')
    expect(window.sessionStorage.getItem('ddm-pmms.token')).toBe('test-token')
  })

  it('shows a generic message for bad credentials and stores no token', async () => {
    server.use(
      loginErrorHandler(422, {
        message: 'The given data was invalid.',
        code: 'validation_failed',
        errors: {
          email: ['The provided credentials are incorrect.'],
        },
      }),
    )

    renderLogin()
    await submitCredentials()

    expect(
      await screen.findByText('The email or password is incorrect.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('The provided credentials are incorrect.'),
    ).toBeInTheDocument()
    expect(useAuthStore.getState().token).toBeNull()
    expect(window.sessionStorage.getItem('ddm-pmms.token')).toBeNull()
  })

  it('shows a throttle notice and disables submit on 429', async () => {
    server.use(
      loginErrorHandler(429, {
        message: 'Too many requests. Please try again later.',
        code: 'too_many_requests',
      }),
    )

    renderLogin()
    await submitCredentials()

    expect(
      await screen.findByText(
        'Too many sign-in attempts. Please wait before trying again.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Try again in 30s' }),
    ).toBeDisabled()
  })

  it('returns to the requested page after signing in again', async () => {
    const user = makeUser({
      role: makeRole('viewer', 'Viewer'),
      permissions: ['ddm.documents.view'],
    })

    server.use(loginSuccessHandler(user), authMeHandler(user))

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/ddm/documents" element={<div>Documents landing</div>} />
      </Routes>,
      { route: '/login' },
    )

    await submitCredentials()

    expect(await screen.findByText('Documents landing')).toBeInTheDocument()
  })
})
