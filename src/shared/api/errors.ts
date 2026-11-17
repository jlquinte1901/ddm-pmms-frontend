import axios, { type AxiosError } from 'axios'

export type ApiErrorFields = Record<string, string[]>

export type ApiErrorInit = {
  status: number
  code: string
  message: string
  errors?: ApiErrorFields
  requestId?: string
}

/**
 * The single error type the UI handles. Axios failures never reach components.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly errors: ApiErrorFields
  readonly requestId: string | null

  constructor({ status, code, message, errors = {}, requestId }: ApiErrorInit) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.errors = errors
    this.requestId = requestId ?? null
  }

  get isUnauthenticated(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  get isValidationError(): boolean {
    return this.status === 422
  }

  fieldError(field: string): string | null {
    return this.errors[field]?.[0] ?? null
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function parseErrorFields(value: unknown): ApiErrorFields {
  const record = asRecord(value)

  if (!record) {
    return {}
  }

  const fields: ApiErrorFields = {}

  for (const [field, messages] of Object.entries(record)) {
    if (!Array.isArray(messages)) {
      continue
    }

    const text = messages.filter(
      (message): message is string => typeof message === 'string',
    )

    if (text.length > 0) {
      fields[field] = text
    }
  }

  return fields
}

function defaultCode(status: number): string {
  switch (status) {
    case 401:
      return 'unauthenticated'
    case 403:
      return 'forbidden'
    case 404:
      return 'not_found'
    case 409:
      return 'state_conflict'
    case 422:
      return 'validation_failed'
    case 429:
      return 'too_many_requests'
    default:
      return status >= 500 ? 'server_error' : 'http_error'
  }
}

function defaultMessage(status: number): string {
  switch (status) {
    case 401:
      return 'Your session has expired. Please sign in again.'
    case 403:
      return 'You do not have permission to do that.'
    case 404:
      return 'The requested item could not be found.'
    case 409:
      return 'This action conflicts with the current state. Refresh and try again.'
    case 422:
      return 'Some of the information you entered is invalid.'
    case 429:
      return 'Too many attempts. Please wait a moment and try again.'
    default:
      return status >= 500
        ? 'The server could not complete the request. Please try again.'
        : 'The request could not be completed.'
  }
}

export function normalizeApiError(
  status: number,
  body: unknown,
  requestId?: string | null,
): ApiError {
  const record = asRecord(body)
  const message =
    typeof record?.message === 'string' && record.message.trim() !== ''
      ? record.message
      : defaultMessage(status)
  const code =
    typeof record?.code === 'string' && record.code.trim() !== ''
      ? record.code
      : defaultCode(status)

  return new ApiError({
    status,
    code,
    message,
    errors: parseErrorFields(record?.errors),
    requestId: requestId ?? undefined,
  })
}

function readRequestId(error: AxiosError): string | undefined {
  const headers = error.response?.headers
  const value = headers?.['x-request-id']

  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0]
  }

  return undefined
}

async function readBlobBody(blob: Blob): Promise<unknown> {
  try {
    const text = await blob.text()

    return text.trim() === '' ? null : (JSON.parse(text) as unknown)
  } catch {
    return null
  }
}

/**
 * Converts an Axios failure into the shared ApiError shape.
 * Blob responses (downloads) are read as text before parsing.
 */
export async function normalizeAxiosError(error: unknown): Promise<ApiError> {
  if (!axios.isAxiosError(error)) {
    return new ApiError({
      status: 0,
      code: 'unknown_error',
      message: 'Something went wrong. Please try again.',
    })
  }

  if (!error.response) {
    const timedOut =
      error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'

    return new ApiError({
      status: 0,
      code: timedOut ? 'timeout' : 'network_error',
      message: timedOut
        ? 'The server took too long to respond. Please try again.'
        : 'Unable to reach the server. Check your connection and try again.',
    })
  }

  let body: unknown = error.response.data

  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    body = await readBlobBody(body)
  }

  return normalizeApiError(
    error.response.status,
    body,
    readRequestId(error),
  )
}

export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error && error.message.trim() !== '') {
    return error.message
  }

  return fallback
}
