import { PERMISSIONS } from '@/shared/lib/permissions'

/**
 * The landing page after sign-in: PMMS dashboard, then DDM documents,
 * then the no-access page for a Viewer without module grants.
 */
export function getLandingPath(permissionNames: readonly string[]): string {
  if (permissionNames.includes(PERMISSIONS.PMMS_DASHBOARD_VIEW)) {
    return '/pmms/dashboard'
  }

  if (permissionNames.includes(PERMISSIONS.DDM_DOCUMENTS_VIEW)) {
    return '/ddm/documents'
  }

  return '/no-access'
}
