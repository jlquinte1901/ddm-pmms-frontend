import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { logoutRequest } from '@/shared/auth/api'
import { useAuthStore } from '@/shared/auth/authStore'
import { authKeys } from '@/shared/auth/queryKeys'

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const clearSession = useAuthStore((state) => state.clearSession)

  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      clearSession('logout')
      queryClient.removeQueries({ queryKey: authKeys.me })
      navigate('/login', { replace: true })
    },
  })
}
