import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ApiError } from '@/shared/api/errors'
import {
  ErrorState,
  LoadingState,
} from '@/shared/components/states'
import { useAuthStore } from './authStore'
import { useCurrentUser } from './useCurrentUser'

function SessionLoading() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <LoadingState label="Loading your session\u2026" />
    </div>
  )
}

export function RequireAuth() {
  const token = useAuthStore((state) => state.token)
  const location = useLocation()
  const currentUser = useCurrentUser()

  if (token === null) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  if (currentUser.isPending) {
    return <SessionLoading />
  }

  if (currentUser.isError) {
    if (
      currentUser.error instanceof ApiError &&
      currentUser.error.status === 401
    ) {
      return <Navigate to="/login" replace />
    }

    return (
      <div className="mx-auto max-w-5xl p-6">
        <ErrorState
          error={currentUser.error}
          title="Could not load your session"
          onRetry={() => {
            void currentUser.refetch()
          }}
        />
      </div>
    )
  }

  return <Outlet />
}
