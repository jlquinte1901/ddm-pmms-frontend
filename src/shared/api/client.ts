import axios from 'axios'
import { useAuthStore } from '@/shared/auth/authStore'
import { authKeys } from '@/shared/auth/queryKeys'
import { normalizeAxiosError } from './errors'
import { queryClient } from './queryClient'

const API_PATH = '/api/v1'
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL
  ?.trim()
  .replace(/\/+$/, '')

export const API_BASE_URL = configuredApiBaseUrl
  ? configuredApiBaseUrl.endsWith(API_PATH)
    ? configuredApiBaseUrl
    : `${configuredApiBaseUrl}${API_PATH}`
  : API_PATH

/**
 * The only Axios instance in the app. It attaches the Bearer token and
 * rejects with ApiError, so components never see an Axios error.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const apiError = await normalizeAxiosError(error)

    if (apiError.status === 401) {
      useAuthStore.getState().expireSession()
      queryClient.removeQueries({ queryKey: authKeys.me })
    }

    return Promise.reject(apiError)
  },
)
