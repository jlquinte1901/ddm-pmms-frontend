import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { changePasswordErrorHandler } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'
import { ChangePasswordPage } from './ChangePasswordPage'

async function fill(
  user: ReturnType<typeof userEvent.setup>,
  values: { current: string; next: string; confirm: string },
) {
  await user.type(screen.getByLabelText('Current password'), values.current)
  await user.type(screen.getByLabelText('New password'), values.next)
  await user.type(
    screen.getByLabelText('Confirm new password'),
    values.confirm,
  )
}

describe('ChangePasswordPage', () => {
  it('submits the password payload and shows the revocation notice', async () => {
    const user = userEvent.setup()
    const captured: { body: unknown } = { body: null }

    server.use(
      http.post('*/api/v1/auth/change-password', async ({ request }) => {
        captured.body = await request.json()

        return new HttpResponse(null, { status: 204 })
      }),
    )

    renderWithProviders(<ChangePasswordPage />)
    await fill(user, {
      current: 'OldPassword@123',
      next: 'NewPassword@123',
      confirm: 'NewPassword@123',
    })
    await user.click(screen.getByRole('button', { name: 'Change password' }))

    await waitFor(() => expect(captured.body).not.toBeNull())
    expect(captured.body).toEqual({
      current_password: 'OldPassword@123',
      password: 'NewPassword@123',
      password_confirmation: 'NewPassword@123',
    })
    expect(
      await screen.findByText(/All other sessions have been signed out/),
    ).toBeInTheDocument()
  })

  it('validates the 12-character minimum and confirmation', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ChangePasswordPage />)
    await fill(user, {
      current: 'OldPassword@123',
      next: 'short',
      confirm: 'different',
    })
    await user.click(screen.getByRole('button', { name: 'Change password' }))

    expect(
      await screen.findByText('New password must be at least 12 characters.'),
    ).toBeInTheDocument()
    expect(screen.getByText('The passwords do not match.')).toBeInTheDocument()
  })

  it('maps the current-password error from the API', async () => {
    const user = userEvent.setup()

    server.use(
      changePasswordErrorHandler(422, {
        message: 'The given data was invalid.',
        code: 'validation_failed',
        errors: {
          current_password: ['The current password is incorrect.'],
        },
      }),
    )

    renderWithProviders(<ChangePasswordPage />)
    await fill(user, {
      current: 'WrongPassword@123',
      next: 'NewPassword@123',
      confirm: 'NewPassword@123',
    })
    await user.click(screen.getByRole('button', { name: 'Change password' }))

    expect(
      await screen.findByText('The current password is incorrect.'),
    ).toBeInTheDocument()
  })
})
