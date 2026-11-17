import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { makeUser } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'
import { RequirePermission } from './RequirePermission'

function renderGuardedRoute(permissions: string[]) {
  return renderWithProviders(
    <Routes>
      <Route
        element={<RequirePermission permission="users.manage" />}
      >
        <Route path="/admin/users" element={<div>User administration</div>} />
      </Route>
    </Routes>,
    {
      route: '/admin/users',
      user: makeUser({ permissions }),
    },
  )
}

describe('RequirePermission', () => {
  it('renders the route when the permission is granted', () => {
    renderGuardedRoute(['users.manage'])

    expect(screen.getByText('User administration')).toBeInTheDocument()
  })

  it('shows a forbidden state for a direct URL without permission', () => {
    renderGuardedRoute(['ddm.documents.view'])

    expect(screen.queryByText('User administration')).not.toBeInTheDocument()
    expect(screen.getByText('You do not have access')).toBeInTheDocument()
  })
})
