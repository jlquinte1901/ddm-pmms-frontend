import { useQuery } from '@tanstack/react-query'
import { fetchCurrentUser } from './api'
import { useAuthStore } from './authStore'
import { authKeys } from './queryKeys'

export function useCurrentUser() {
  const token = useAuthStore((state) => state.token)

  return useQuery({
    queryKey: authKeys.me,
    queryFn: fetchCurrentUser,
    enabled: token !== null,
    staleTime: 5 * 60_000,
    retry: false,
  })
}

export function useCurrentPermissions(): string[] {
  const { data } = useCurrentUser()

  return data?.permissions.map((permission) => permission.name) ?? []
}
