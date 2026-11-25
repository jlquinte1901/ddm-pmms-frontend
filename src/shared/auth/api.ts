import { apiClient } from '@/shared/api/client'
import type {
  AuthUser,
  LoginResponse,
} from '@/shared/types/api'

export type LoginPayload = {
  email: string
  password: string
  device_name?: string
}

export type ChangePasswordPayload = {
  current_password: string
  password: string
  password_confirmation: string
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<{ data: AuthUser }>('/auth/me')

  return data.data
}

export async function loginRequest(
  payload: LoginPayload,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', {
    ...payload,
    device_name: payload.device_name ?? 'ddm-pmms-web',
  })

  return data
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function changePasswordRequest(
  payload: ChangePasswordPayload,
): Promise<void> {
  await apiClient.post('/auth/change-password', payload)
}
