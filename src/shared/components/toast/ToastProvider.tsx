import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import {
  ToastContext,
  type ToastApi,
  type ToastInput,
  type ToastVariant,
} from './toast-context'

type ToastItem = ToastInput & { id: number }

let nextToastId = 1

const variantClasses: Record<ToastVariant, string> = {
  success: 'border-l-success',
  error: 'border-l-destructive',
  info: 'border-l-info',
}

const variantIcons: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle2 aria-hidden="true" className="size-4 text-success" />,
  error: <AlertCircle aria-hidden="true" className="size-4 text-destructive" />,
  info: <Info aria-hidden="true" className="size-4 text-info" />,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id)

    if (timer !== undefined) {
      clearTimeout(timer)
      timers.current.delete(id)
    }

    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const show = useCallback(
    (input: ToastInput) => {
      const id = nextToastId
      nextToastId += 1

      setToasts((current) => [...current, { ...input, id }])

      const duration = input.duration ?? 5_000
      const timer = setTimeout(() => dismiss(id), duration)
      timers.current.set(id, timer)
    },
    [dismiss],
  )

  useEffect(() => {
    const activeTimers = timers.current

    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer))
      activeTimers.clear()
    }
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      show,
      dismiss,
      success: (title, description) =>
        show({ title, description, variant: 'success' }),
      error: (title, description) =>
        show({ title, description, variant: 'error' }),
      info: (title, description) =>
        show({ title, description, variant: 'info' }),
    }),
    [show, dismiss],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end"
      >
        {toasts.map((toast) => {
          const variant = toast.variant ?? 'info'

          return (
            <div
              key={toast.id}
              role={variant === 'error' ? 'alert' : 'status'}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-l-4 bg-card p-3 text-left shadow-lg',
                variantClasses[variant],
              )}
            >
              <span className="mt-0.5">{variantIcons[variant]}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {toast.title}
                </p>
                {toast.description ? (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Dismiss notification"
                onClick={() => dismiss(toast.id)}
              >
                <X aria-hidden="true" />
              </Button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
