import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './errors'

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false
  }

  return failureCount < 2
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: shouldRetry,
    },
    mutations: {
      retry: false,
    },
  },
})
