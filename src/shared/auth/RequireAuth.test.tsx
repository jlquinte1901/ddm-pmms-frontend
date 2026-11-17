import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { makeUser } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'
import { useAuthStore } from './authStore'
import { RequireAuth } from './RequireAuth'

describe('RequireAuth', () => {
  it('sends a visitor without a token to the login page', () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<RequireAuth />}>
          <Route index element={<div>Protected content</div>} />
        </Route>
        <Route path="/login" element={<div>Login screen</div>} />
      </Routes>,
      { route: '/' },
    )

    expect(screen.getByText('Login screen')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('renders protected content when the session is valid', () => {
    useAuthStore.getState().setToken('test-token')

    renderWithProviders(
      <Routes>
        <Route path="/" element={<RequireAuth />}>
          <Route index element={<div>Protected content</div>} />
        </Route>
      </Routes>,
      {
        route: '/',
        user: makeUser({ permissions: ['ddm.documents.view'] }),
      },
    )

    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })
})
