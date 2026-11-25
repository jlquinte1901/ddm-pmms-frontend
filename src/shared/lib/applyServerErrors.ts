import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError, getErrorMessage } from '@/shared/api/errors'

/**
 * Maps a rejected mutation error onto a React Hook Form instance. Validation
 * errors (422) are attached to their fields; anything else becomes a single
 * top-level message.
 */
export function applyServerErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  error: unknown,
  setServerError: (message: string) => void,
): void {
  if (error instanceof ApiError && error.isValidationError) {
    for (const [field, messages] of Object.entries(error.errors)) {
      const message = messages[0]

      if (message !== undefined) {
        setError(field as Path<T>, { type: 'server', message })
      }
    }

    setServerError(error.message)
    return
  }

  setServerError(getErrorMessage(error))
}
