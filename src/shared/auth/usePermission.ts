import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from '@/shared/lib/permissions'
import { useCurrentPermissions } from './useCurrentUser'

export function usePermission(permission: string): boolean {
  return hasPermission(useCurrentPermissions(), permission)
}

export function useAnyPermission(permissions: readonly string[]): boolean {
  return hasAnyPermission(useCurrentPermissions(), permissions)
}

export function useAllPermissions(permissions: readonly string[]): boolean {
  return hasAllPermissions(useCurrentPermissions(), permissions)
}
