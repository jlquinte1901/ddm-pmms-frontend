import { AlertTriangle, RefreshCw } from 'lucide-react'
import { getErrorMessage } from '@/shared/api/errors'
import { Button } from '@/components/ui/button'
import { StateLayout } from './StateLayout'

type ErrorStateProps = {
  error?: unknown
  title?: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorState({
  error,
  title = 'Something went wrong',
  description,
  onRetry,
  retryLabel = 'Try again',
}: ErrorStateProps) {
  const message = description ?? getErrorMessage(error)

  return (
    <div role="alert">
      <StateLayout
        icon={<AlertTriangle />}
        title={title}
        description={message}
        tone="danger"
        action={
          onRetry ? (
            <Button type="button" variant="outline" onClick={onRetry}>
              <RefreshCw aria-hidden="true" />
              {retryLabel}
            </Button>
          ) : undefined
        }
      />
    </div>
  )
}
