import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { useAuthStore } from '@/shared/auth/authStore'
import { server } from './msw/server'

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  window.sessionStorage.clear()
  useAuthStore.setState({ token: null, sessionExpired: false })
})

afterAll(() => {
  server.close()
})
