import { Loader2 } from 'lucide-react'
import { Skeleton } from './Skeleton'

type LoadingStateProps = {
  label?: string
  variant?: 'page' | 'table' | 'inline'
}

export function LoadingState({
  label = 'Loading\u2026',
  variant = 'page',
}: LoadingStateProps) {
  if (variant === 'inline') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        <span>{label}</span>
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="overflow-hidden rounded-xl border bg-card"
      >
        <span className="sr-only">{label}</span>
        <div className="h-10 border-b bg-muted/60" />
        <div className="divide-y">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-4 w-1/6" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div role="status" aria-live="polite" aria-busy="true" className="space-y-6">
      <span className="sr-only">{label}</span>
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
