import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { makeRole, makeUser } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'
import { AppShell } from './AppShell'

function renderShell(permissions: string[], route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route path="pmms/projects" element={<div>Projects page</div>} />
        <Route path="ddm/documents" element={<div>Documents page</div>} />
      </Route>
    </Routes>,
    {
      route,
      user: makeUser({
        role: makeRole('viewer', 'Viewer'),
        permissions,
      }),
    },
  )
}

describe('AppShell', () => {
  it('shows the department bar and only the granted tabs', () => {
    renderShell(['ddm.documents.view'], '/ddm/documents')

    expect(screen.getByText('City Engineering Department')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Documents' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Download requests' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Projects' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Dashboard' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Documents page')).toBeInTheDocument()
  })

  it('shows Projects to a Project Engineer without admin tabs', () => {
    renderShell(
      [
        'pmms.projects.view-own',
        'pmms.projects.manage-own',
        'ddm.documents.view',
      ],
      '/pmms/projects',
    )

    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Users' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Audit trail' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Projects page')).toBeInTheDocument()
  })

  it('shows administrative tabs to an administrator', () => {
    renderShell(
      ['users.manage', 'roles.manage', 'audit.view'],
      '/ddm/documents',
    )

    expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Roles' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Audit trail' })).toBeInTheDocument()
  })
})
