import { Component, type ReactNode } from 'react'
import { ErrorState } from '@/shared/components/states'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

/**
 * Keeps one failing screen from blanking the whole application.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title="This screen could not be displayed"
          description="An unexpected problem occurred while rendering this screen. Try again, or reload the page if it keeps happening."
          onRetry={() => this.setState({ hasError: false })}
        />
      )
    }

    return this.props.children
  }
}
