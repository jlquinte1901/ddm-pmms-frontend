import { PERMISSIONS } from '@/shared/lib/permissions'

export type AppNavItem = {
  label: string
  to: string
  anyOf: readonly string[]
}

export const APP_NAV_ITEMS: readonly AppNavItem[] = [
  {
    label: 'Dashboard',
    to: '/pmms/dashboard',
    anyOf: [PERMISSIONS.PMMS_DASHBOARD_VIEW],
  },
  {
    label: 'Projects',
    to: '/pmms/projects',
    anyOf: [
      PERMISSIONS.PMMS_PROJECTS_VIEW_ALL,
      PERMISSIONS.PMMS_PROJECTS_VIEW_OWN,
    ],
  },
  {
    label: 'Documents',
    to: '/ddm/documents',
    anyOf: [PERMISSIONS.DDM_DOCUMENTS_VIEW],
  },
  {
    label: 'Categories',
    to: '/ddm/categories',
    anyOf: [PERMISSIONS.DDM_CATEGORIES_MANAGE],
  },
  {
    label: 'Download requests',
    to: '/ddm/download-requests',
    anyOf: [
      PERMISSIONS.DDM_DOCUMENTS_VIEW,
      PERMISSIONS.DDM_DOWNLOADS_REQUEST,
      PERMISSIONS.DDM_DOWNLOADS_APPROVE_RESTRICTED,
      PERMISSIONS.DDM_DOWNLOADS_APPROVE_CONFIDENTIAL,
    ],
  },
  {
    label: 'Reports',
    to: '/pmms/reports',
    anyOf: [PERMISSIONS.PMMS_REPORTS_VIEW],
  },
  {
    label: 'Users',
    to: '/admin/users',
    anyOf: [PERMISSIONS.USERS_MANAGE],
  },
  {
    label: 'Roles',
    to: '/admin/roles',
    anyOf: [PERMISSIONS.ROLES_MANAGE],
  },
  {
    label: 'Audit trail',
    to: '/admin/audit-logs',
    anyOf: [PERMISSIONS.AUDIT_VIEW],
  },
]

export function getVisibleNavItems(
  permissionNames: readonly string[],
): AppNavItem[] {
  return APP_NAV_ITEMS.filter((item) =>
    item.anyOf.some((permission) => permissionNames.includes(permission)),
  )
}
