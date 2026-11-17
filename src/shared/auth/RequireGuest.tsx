import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { LoadingState } from '@/shared/components/states'
import { getLandingPath } from './landing'
import { useAuthStore } from './authStore'
import { useCurrentUser } from './useCurrentUser'

export function RequireGuest({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token)
  const currentUser = useCurrentUser()

  if (token !== null) {
    if (currentUser.isPending) {
      return (
        <div className="mx-auto max-w-5xl p-6">
          <LoadingState label="Loading your session\u2026" />
        </div>
      )
    }

    if (currentUser.isSuccess) {
      const permissions = currentUser.data.permissions.map(
        (permission) => permission.name,
      )

      return <Navigate to={getLandingPath(permissions)} replace />
    }
  }

  return <>{children}</>
}
