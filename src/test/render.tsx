import type { ReactElement, ReactNode } from 'react'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '@/shared/components/toast/ToastProvider'
import { authKeys } from '@/shared/auth/queryKeys'
import type { AuthUser } from '@/shared/types/api'

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

type RenderWithProvidersOptions = {
  route?: string
  user?: AuthUser
  queryClient?: QueryClient
}

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', user, queryClient }: RenderWithProvidersOptions = {},
) {
  const client = queryClient ?? createTestQueryClient()

  if (user) {
    client.setQueryData(authKeys.me, user)
  }

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <ToastProvider>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    )
  }

  return {
    queryClient: client,
    ...render(ui, { wrapper: Wrapper }),
  }
}
