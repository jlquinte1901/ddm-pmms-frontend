import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { Can } from './Can'
import { usePermission } from './usePermission'
import { makeUser } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'

function PermissionProbe({ permission }: { permission: string }) {
  const allowed = usePermission(permission)

  return <span>{allowed ? 'allowed' : 'denied'}</span>
}

describe('Can', () => {
  it('renders children when the user has the permission', () => {
    renderWithProviders(
      <Can permission="ddm.documents.view">
        <span>Document tools</span>
      </Can>,
      { user: makeUser({ permissions: ['ddm.documents.view'] }) },
    )

    expect(screen.getByText('Document tools')).toBeInTheDocument()
  })

  it('renders the fallback when the permission is missing', () => {
    renderWithProviders(
      <Can
        permission="users.manage"
        fallback={<span>Not available</span>}
      >
        <span>User tools</span>
      </Can>,
      { user: makeUser({ permissions: ['ddm.documents.view'] }) },
    )

    expect(screen.queryByText('User tools')).not.toBeInTheDocument()
    expect(screen.getByText('Not available')).toBeInTheDocument()
  })

  it('supports anyOf for module entry points', () => {
    renderWithProviders(
      <Can
        anyOf={['pmms.projects.view-all', 'pmms.projects.view-own']}
        fallback={<span>No project list</span>}
      >
        <span>Project list</span>
      </Can>,
      { user: makeUser({ permissions: ['pmms.projects.view-own'] }) },
    )

    expect(screen.getByText('Project list')).toBeInTheDocument()
  })

  it('requires every permission in allOf', () => {
    renderWithProviders(
      <Can
        allOf={['ddm.documents.view', 'ddm.documents.upload']}
        fallback={<span>Read only</span>}
      >
        <span>Upload tools</span>
      </Can>,
      { user: makeUser({ permissions: ['ddm.documents.view'] }) },
    )

    expect(screen.queryByText('Upload tools')).not.toBeInTheDocument()
    expect(screen.getByText('Read only')).toBeInTheDocument()
  })

  it('shows the loading fallback while the session is loading', () => {
    renderWithProviders(
      <Can permission="ddm.documents.view" loadingFallback={<span>Checking</span>}>
        <span>Document tools</span>
      </Can>,
    )

    expect(screen.getByText('Checking')).toBeInTheDocument()
  })
})

describe('usePermission', () => {
  it('reads effective permissions from the session', () => {
    renderWithProviders(<PermissionProbe permission="users.manage" />, {
      user: makeUser({ permissions: ['users.manage'] }),
    })

    expect(screen.getByText('allowed')).toBeInTheDocument()
  })

  it('denies a permission the user does not have', () => {
    renderWithProviders(<PermissionProbe permission="users.manage" />, {
      user: makeUser({ permissions: ['ddm.documents.view'] }),
    })

    expect(screen.getByText('denied')).toBeInTheDocument()
  })
})
