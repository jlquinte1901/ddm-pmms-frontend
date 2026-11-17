import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { ErrorState } from '@/shared/components/states'

export function RouteErrorPage() {
  const error = useRouteError()
  const description = isRouteErrorResponse(error) && error.status === 404
    ? 'The page you requested could not be found.'
    : 'An unexpected problem occurred while loading this page. Reload to try again.'

  return (
    <div className="mx-auto max-w-5xl p-6">
      <ErrorState
        description={description}
        onRetry={() => window.location.reload()}
        retryLabel="Reload page"
      />
    </div>
  )
}
