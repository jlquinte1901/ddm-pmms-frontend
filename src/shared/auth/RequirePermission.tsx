import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import {
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/shared/components/states'
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from '@/shared/lib/permissions'
import { useCurrentUser } from './useCurrentUser'

type RequirePermissionProps = {
  permission?: string
  anyOf?: readonly string[]
  allOf?: readonly string[]
  children?: ReactNode
}

/**
 * Route guard for permission-protected screens. It renders the forbidden
 * state rather than redirecting, so direct URLs are honest about why they
 * cannot be opened.
 */
export function RequirePermission({
  permission,
  anyOf,
  allOf,
  children,
}: RequirePermissionProps) {
  const currentUser = useCurrentUser()

  if (currentUser.isPending) {
    return <LoadingState label="Checking your access\u2026" />
  }

  if (currentUser.isError) {
    return (
      <ErrorState
        error={currentUser.error}
        title="Could not check your access"
        onRetry={() => {
          void currentUser.refetch()
        }}
      />
    )
  }

  const granted = currentUser.data.permissions.map((item) => item.name)
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

  if (checks.length > 0 && !checks.every(Boolean)) {
    return <ForbiddenState />
  }

  return <>{children ?? <Outlet />}</>
}
