import { Navigate } from 'react-router-dom'
import { getLandingPath } from '@/shared/auth/landing'
import { useCurrentPermissions } from '@/shared/auth/useCurrentUser'

export function LandingRedirect() {
  return (
    <Navigate to={getLandingPath(useCurrentPermissions())} replace />
  )
}
