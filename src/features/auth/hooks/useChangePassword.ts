import { useMutation } from '@tanstack/react-query'
import {
  changePasswordRequest,
  type ChangePasswordPayload,
} from '@/shared/auth/api'

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      changePasswordRequest(payload),
  })
}
