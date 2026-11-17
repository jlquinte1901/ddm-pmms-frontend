import type { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'
import {
  ApiError,
  getErrorMessage,
  normalizeApiError,
  normalizeAxiosError,
} from './errors'

describe('normalizeApiError', () => {
  it('keeps the server message, code, and field errors', () => {
    const error = normalizeApiError(422, {
      message: 'The given data was invalid.',
      code: 'validation_failed',
      errors: { email: ['The provided credentials are incorrect.'] },
    })

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(422)
    expect(error.code).toBe('validation_failed')
    expect(error.message).toBe('The given data was invalid.')
    expect(error.fieldError('email')).toBe(
      'The provided credentials are incorrect.',
    )
    expect(error.isValidationError).toBe(true)
  })

  it('preserves the download_approval_required code', () => {
    const error = normalizeApiError(403, {
      message: 'An approved download request is required.',
      code: 'download_approval_required',
      errors: {},
    })

    expect(error.status).toBe(403)
    expect(error.code).toBe('download_approval_required')
    expect(error.isForbidden).toBe(true)
  })

  it('falls back to a safe message and code for an unknown body', () => {
    const error = normalizeApiError(500, null)

    expect(error.status).toBe(500)
    expect(error.code).toBe('server_error')
    expect(error.message).toBe(
      'The server could not complete the request. Please try again.',
    )
    expect(error.errors).toEqual({})
  })

  it('ignores malformed field error values', () => {
    const error = normalizeApiError(422, {
      message: 'Invalid',
      code: 'validation_failed',
      errors: { email: 'not-an-array', password: [1, 'Too short'] },
    })

    expect(error.errors).toEqual({ password: ['Too short'] })
  })
})

describe('normalizeAxiosError', () => {
  it('turns a network failure into a friendly message', async () => {
    const axiosError = {
      isAxiosError: true,
      message: 'Network Error',
      code: 'ERR_NETWORK',
    } as unknown as AxiosError

    const error = await normalizeAxiosError(axiosError)

    expect(error.status).toBe(0)
    expect(error.code).toBe('network_error')
    expect(error.message).toContain('Unable to reach the server')
  })

  it('reads a blob error body as the standard error JSON', async () => {
    const axiosError = {
      isAxiosError: true,
      message: 'Request failed',
      response: {
        status: 403,
        data: new Blob([
          JSON.stringify({
            message: 'An approved download request is required.',
            code: 'download_approval_required',
            errors: {},
          }),
        ]),
        headers: { 'x-request-id': 'request-123' },
      },
    } as unknown as AxiosError

    const error = await normalizeAxiosError(axiosError)

    expect(error.status).toBe(403)
    expect(error.code).toBe('download_approval_required')
    expect(error.requestId).toBe('request-123')
  })

  it('does not expose a non-Axios exception message', async () => {
    const error = await normalizeAxiosError(new Error('database exploded'))

    expect(error.status).toBe(0)
    expect(error.code).toBe('unknown_error')
    expect(error.message).not.toContain('database exploded')
  })
})

describe('getErrorMessage', () => {
  it('returns the ApiError message when available', () => {
    expect(
      getErrorMessage(
        new ApiError({
          status: 404,
          code: 'not_found',
          message: 'Resource not found.',
        }),
      ),
    ).toBe('Resource not found.')
  })

  it('returns the fallback for an empty Error', () => {
    expect(getErrorMessage(new Error(''), 'Fallback')).toBe('Fallback')
  })
})
