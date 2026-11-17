import { createContext, useContext } from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

export type ToastInput = {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

export type ToastApi = {
  show: (input: ToastInput) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  dismiss: (id: number) => void
}

export const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const context = useContext(ToastContext)

  if (context === null) {
    throw new Error('useToast must be used inside a ToastProvider.')
  }

  return context
}
