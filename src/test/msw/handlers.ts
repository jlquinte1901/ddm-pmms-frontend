import { http, HttpResponse } from 'msw'
import type { AuthUser } from '@/shared/types/api'

export function authMeHandler(user: AuthUser) {
  return http.get('*/api/v1/auth/me', () => HttpResponse.json({ data: user }))
}

export function loginSuccessHandler(user: AuthUser, token = 'test-token') {
  return http.post('*/api/v1/auth/login', () =>
    HttpResponse.json({
      token,
      token_type: 'Bearer',
      expires_at: '2026-11-17T23:59:59+08:00',
      user,
    }),
  )
}

export function loginErrorHandler(
  status: number,
  body: { message: string; code: string; errors?: Record<string, string[]> },
) {
  return http.post('*/api/v1/auth/login', () =>
    HttpResponse.json(
      {
        message: body.message,
        code: body.code,
        errors: body.errors ?? {},
      },
      { status },
    ),
  )
}
