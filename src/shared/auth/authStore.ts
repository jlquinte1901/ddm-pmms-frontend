import { create } from 'zustand'

const TOKEN_KEY = 'ddm-pmms.token'

export type SessionClearReason = 'logout' | 'expired'

type AuthState = {
  token: string | null
  sessionExpired: boolean
  setToken: (token: string) => void
  clearSession: (reason?: SessionClearReason) => void
  expireSession: () => void
  dismissSessionExpired: () => void
}

function readStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function writeStoredToken(token: string | null): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    if (token === null) {
      window.sessionStorage.removeItem(TOKEN_KEY)
      return
    }

    window.sessionStorage.setItem(TOKEN_KEY, token)
  } catch {
    // sessionStorage can be unavailable (private mode, blocked storage).
  }
}

/**
 * Only the token is persisted (decision 20). The user and permissions are
 * always re-fetched from GET /auth/me.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  token: readStoredToken(),
  sessionExpired: false,
  setToken: (token) => {
    writeStoredToken(token)
    set({ token, sessionExpired: false })
  },
  clearSession: (reason) => {
    writeStoredToken(null)
    set({ token: null, sessionExpired: reason === 'expired' })
  },
  expireSession: () => {
    if (get().token === null) {
      return
    }

    writeStoredToken(null)
    set({ token: null, sessionExpired: true })
  },
  dismissSessionExpired: () => set({ sessionExpired: false }),
}))
