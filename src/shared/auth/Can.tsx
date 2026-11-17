import type { ReactNode } from 'react'
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from '@/shared/lib/permissions'
import { useCurrentPermissions, useCurrentUser } from './useCurrentUser'

export type CanProps = {
  permission?: string
  anyOf?: readonly string[]
  allOf?: readonly string[]
  children: ReactNode
  fallback?: ReactNode
  loadingFallback?: ReactNode
}

/**
 * Renders children only when the signed-in user has the required permission.
 * This is a convenience for the UI; the backend remains the authority.
 */
export function Can({
  permission,
  anyOf,
  allOf,
  children,
  fallback = null,
  loadingFallback = null,
}: CanProps) {
  const { isPending } = useCurrentUser()
  const granted = useCurrentPermissions()

  if (isPending) {
    return <>{loadingFallback}</>
  }

  const checks: boolean[] = []

  if (permission !== undefined) {
    checks.push(hasPermission(granted, permission))
  }

  if (anyOf !== undefined && anyOf.length > 0) {
    checks.push(hasAnyPermission(granted, anyOf))
  }

  if (allOf !== undefined && allOf.length > 0) {
    checks.push(hasAllPermissions(granted, allOf))
  }

  const allowed = checks.length === 0 || checks.every(Boolean)

  return <>{allowed ? children : fallback}</>
}
