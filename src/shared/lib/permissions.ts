/**
 * The permission catalogue mirrors the backend PermissionName enum.
 * UI checks use these strings; roles are never hardcoded in components.
 */
export const PERMISSIONS = {
  USERS_MANAGE: 'users.manage',
  ROLES_MANAGE: 'roles.manage',
  AUDIT_VIEW: 'audit.view',

  DDM_DOCUMENTS_VIEW: 'ddm.documents.view',
  DDM_DOCUMENTS_UPLOAD: 'ddm.documents.upload',
  DDM_DOCUMENTS_ARCHIVE: 'ddm.documents.archive',
  DDM_DOCUMENTS_DELETE: 'ddm.documents.delete',
  DDM_DOWNLOADS_REQUEST: 'ddm.downloads.request',
  DDM_DOWNLOADS_DIRECT: 'ddm.downloads.direct',
  DDM_DOWNLOADS_APPROVE_RESTRICTED: 'ddm.downloads.approve-restricted',
  DDM_DOWNLOADS_APPROVE_CONFIDENTIAL: 'ddm.downloads.approve-confidential',
  DDM_CATEGORIES_MANAGE: 'ddm.categories.manage',
  DDM_REPORTS_VIEW: 'ddm.reports.view',

  PMMS_PROJECTS_VIEW_ALL: 'pmms.projects.view-all',
  PMMS_PROJECTS_VIEW_OWN: 'pmms.projects.view-own',
  PMMS_PROJECTS_CREATE: 'pmms.projects.create',
  PMMS_PROJECTS_MANAGE_OWN: 'pmms.projects.manage-own',
  PMMS_PROJECTS_ADMINISTER: 'pmms.projects.administer',
  PMMS_DASHBOARD_VIEW: 'pmms.dashboard.view',
  PMMS_REPORTS_VIEW: 'pmms.reports.view',
  PMMS_CATEGORIES_MANAGE: 'pmms.categories.manage',
} as const

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export function hasPermission(
  granted: readonly string[],
  permission: string,
): boolean {
  return granted.includes(permission)
}

export function hasAnyPermission(
  granted: readonly string[],
  permissions: readonly string[],
): boolean {
  return permissions.some((permission) => granted.includes(permission))
}

export function hasAllPermissions(
  granted: readonly string[],
  permissions: readonly string[],
): boolean {
  return permissions.every((permission) => granted.includes(permission))
}
