import { http, HttpResponse } from 'msw'
import type {
  AuthUser,
  Paginated,
  Project,
  ProjectCategory,
} from '@/shared/types/api'
import type { DashboardResponse } from '@/features/pmms/dashboard/types'

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

export function dashboardHandler(dashboard: DashboardResponse) {
  return http.get('*/api/v1/pmms/dashboard', () =>
    HttpResponse.json(dashboard),
  )
}

export function dashboardErrorHandler(
  status: number,
  body: { message: string; code: string },
) {
  return http.get('*/api/v1/pmms/dashboard', () =>
    HttpResponse.json({ message: body.message, code: body.code }, { status }),
  )
}

export function projectsHandler(projects: Paginated<Project>) {
  return http.get('*/api/v1/pmms/projects', () =>
    HttpResponse.json(projects),
  )
}

export function projectsErrorHandler(
  status: number,
  body: { message: string; code: string },
) {
  return http.get('*/api/v1/pmms/projects', () =>
    HttpResponse.json({ message: body.message, code: body.code }, { status }),
  )
}

export function projectCategoriesHandler(
  categories: Paginated<ProjectCategory>,
) {
  return http.get('*/api/v1/pmms/categories', () =>
    HttpResponse.json(categories),
  )
}
