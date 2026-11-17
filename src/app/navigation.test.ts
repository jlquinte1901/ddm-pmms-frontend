import { describe, expect, it } from 'vitest'
import { getVisibleNavItems } from './navigation'
import { PERMISSIONS } from '@/shared/lib/permissions'

function labelsFor(permissions: string[]): string[] {
  return getVisibleNavItems(permissions).map((item) => item.label)
}

describe('getVisibleNavItems', () => {
  it('shows a Viewer only the DDM screens they were granted', () => {
    expect(labelsFor([PERMISSIONS.DDM_DOCUMENTS_VIEW])).toEqual([
      'Documents',
      'Download requests',
    ])
  })

  it('shows a Project Engineer the project and document screens', () => {
    expect(
      labelsFor([
        PERMISSIONS.PMMS_PROJECTS_VIEW_OWN,
        PERMISSIONS.PMMS_PROJECTS_MANAGE_OWN,
        PERMISSIONS.DDM_DOCUMENTS_VIEW,
        PERMISSIONS.DDM_DOWNLOADS_REQUEST,
      ]),
    ).toEqual(['Projects', 'Documents', 'Download requests'])
  })

  it('shows an Admin the dashboard, projects, documents, and reports', () => {
    expect(
      labelsFor([
        PERMISSIONS.PMMS_DASHBOARD_VIEW,
        PERMISSIONS.PMMS_PROJECTS_VIEW_ALL,
        PERMISSIONS.DDM_DOCUMENTS_VIEW,
        PERMISSIONS.DDM_DOWNLOADS_REQUEST,
        PERMISSIONS.PMMS_REPORTS_VIEW,
      ]),
    ).toEqual([
      'Dashboard',
      'Projects',
      'Documents',
      'Download requests',
      'Reports',
    ])
  })

  it('shows administrative screens only with their permissions', () => {
    expect(
      labelsFor([
        PERMISSIONS.USERS_MANAGE,
        PERMISSIONS.ROLES_MANAGE,
        PERMISSIONS.AUDIT_VIEW,
      ]),
    ).toEqual(['Users', 'Roles', 'Audit trail'])
  })

  it('shows nothing to a user with no grants', () => {
    expect(labelsFor([])).toEqual([])
  })
})
