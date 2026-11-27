import { http, HttpResponse } from 'msw'
import type {
  AuthUser,
  Document,
  DocumentCategory,
  DocumentDownloadRequest,
  DocumentVersion,
  Paginated,
  Project,
  ProjectCategory,
  UserSummary,
} from '@/shared/types/api'
import type { DashboardResponse } from '@/features/pmms/dashboard/types'
import type {
  ProjectHistoryEntry,
  ProjectUpdateEntry,
} from '@/features/pmms/projects/types'

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

export function changePasswordHandler() {
  return http.post('*/api/v1/auth/change-password', () =>
    new HttpResponse(null, { status: 204 }),
  )
}

export function changePasswordErrorHandler(
  status: number,
  body: { message: string; code: string; errors?: Record<string, string[]> },
) {
  return http.post('*/api/v1/auth/change-password', () =>
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

export function documentsHandler(documents: Paginated<Document>) {
  return http.get('*/api/v1/ddm/documents', () => HttpResponse.json(documents))
}

export function documentsErrorHandler(
  status: number,
  body: { message: string; code: string },
) {
  return http.get('*/api/v1/ddm/documents', () =>
    HttpResponse.json({ message: body.message, code: body.code }, { status }),
  )
}

export function documentCategoriesHandler(
  categories: Paginated<DocumentCategory>,
) {
  return http.get('*/api/v1/ddm/categories', () =>
    HttpResponse.json(categories),
  )
}

export function categoryCreateHandler(category: DocumentCategory) {
  return http.post('*/api/v1/ddm/categories', () =>
    HttpResponse.json({ data: category }, { status: 201 }),
  )
}

export function categoryCreateErrorHandler(
  status: number,
  body: { message: string; code: string; errors?: Record<string, string[]> },
) {
  return http.post('*/api/v1/ddm/categories', () =>
    HttpResponse.json(
      { message: body.message, code: body.code, errors: body.errors ?? {} },
      { status },
    ),
  )
}

export function categoryUpdateHandler(category: DocumentCategory) {
  return http.patch('*/api/v1/ddm/categories/:categoryId', () =>
    HttpResponse.json({ data: category }),
  )
}

export function documentDetailHandler(document: Document) {
  return http.get('*/api/v1/ddm/documents/:documentId', () =>
    HttpResponse.json({ data: document }),
  )
}

export function documentDetailErrorHandler(
  status: number,
  body: { message: string; code: string },
) {
  return http.get('*/api/v1/ddm/documents/:documentId', () =>
    HttpResponse.json({ message: body.message, code: body.code }, { status }),
  )
}

export function documentCreateHandler(document: Document) {
  return http.post('*/api/v1/ddm/documents', () =>
    HttpResponse.json({ data: document }, { status: 201 }),
  )
}

export function documentCreateErrorHandler(
  status: number,
  body: { message: string; code: string; errors?: Record<string, string[]> },
) {
  return http.post('*/api/v1/ddm/documents', () =>
    HttpResponse.json(
      { message: body.message, code: body.code, errors: body.errors ?? {} },
      { status },
    ),
  )
}

export function documentArchiveHandler(document: Document) {
  return http.post('*/api/v1/ddm/documents/:documentId/archive', () =>
    HttpResponse.json({ data: { ...document, is_archived: true } }),
  )
}

export function documentUnarchiveHandler(document: Document) {
  return http.post('*/api/v1/ddm/documents/:documentId/unarchive', () =>
    HttpResponse.json({ data: { ...document, is_archived: false } }),
  )
}

export function documentDeleteHandler() {
  return http.delete('*/api/v1/ddm/documents/:documentId', () =>
    new HttpResponse(null, { status: 204 }),
  )
}

export function documentAddVersionHandler(version: DocumentVersion) {
  return http.post('*/api/v1/ddm/documents/:documentId/versions', () =>
    HttpResponse.json({ data: version }, { status: 201 }),
  )
}

export function downloadRequestsHandler(
  requests: Paginated<DocumentDownloadRequest>,
) {
  return http.get('*/api/v1/ddm/download-requests', () =>
    HttpResponse.json(requests),
  )
}

export function downloadRequestsErrorHandler(
  status: number,
  body: { message: string; code: string },
) {
  return http.get('*/api/v1/ddm/download-requests', () =>
    HttpResponse.json({ message: body.message, code: body.code }, { status }),
  )
}

export function downloadRequestApproveHandler(
  request: DocumentDownloadRequest,
) {
  return http.post('*/api/v1/ddm/download-requests/:requestId/approve', () =>
    HttpResponse.json({ data: request }),
  )
}

export function downloadRequestDenyHandler(
  request: DocumentDownloadRequest,
) {
  return http.post('*/api/v1/ddm/download-requests/:requestId/deny', () =>
    HttpResponse.json({ data: request }),
  )
}

export function projectCategoriesHandler(
  categories: Paginated<ProjectCategory>,
) {
  return http.get('*/api/v1/pmms/categories', () =>
    HttpResponse.json(categories),
  )
}

export function projectDetailHandler(project: Project) {
  return http.get('*/api/v1/pmms/projects/:projectId', () =>
    HttpResponse.json({ data: project }),
  )
}

export function projectDetailErrorHandler(
  status: number,
  body: { message: string; code: string },
) {
  return http.get('*/api/v1/pmms/projects/:projectId', () =>
    HttpResponse.json({ message: body.message, code: body.code }, { status }),
  )
}

export function projectHistoryHandler(
  history: Paginated<ProjectHistoryEntry>,
) {
  return http.get('*/api/v1/pmms/projects/:projectId/history', () =>
    HttpResponse.json(history),
  )
}

export function projectUpdatesHandler(
  updates: Paginated<ProjectUpdateEntry>,
) {
  return http.get('*/api/v1/pmms/projects/:projectId/updates', () =>
    HttpResponse.json(updates),
  )
}

export function projectCreateHandler(project: Project) {
  return http.post('*/api/v1/pmms/projects', () =>
    HttpResponse.json({ data: project }, { status: 201 }),
  )
}

export function projectCreateErrorHandler(
  status: number,
  body: { message: string; code: string; errors?: Record<string, string[]> },
) {
  return http.post('*/api/v1/pmms/projects', () =>
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

export function projectUpdateHandler(project: Project) {
  return http.put('*/api/v1/pmms/projects/:projectId', () =>
    HttpResponse.json({ data: project }),
  )
}

export function projectStartHandler(project: Project) {
  return http.post('*/api/v1/pmms/projects/:projectId/start', () =>
    HttpResponse.json({ data: project }),
  )
}

export function projectProgressHandler(project: Project) {
  return http.post('*/api/v1/pmms/projects/:projectId/progress', () =>
    HttpResponse.json({ data: project }),
  )
}

export function projectPauseHandler(project: Project) {
  return http.post('*/api/v1/pmms/projects/:projectId/pause', () =>
    HttpResponse.json({ data: project }),
  )
}

export function projectResumeHandler(project: Project) {
  return http.post('*/api/v1/pmms/projects/:projectId/resume', () =>
    HttpResponse.json({ data: project }),
  )
}

export function projectLifecycleErrorHandler(
  status: number,
  body: { message: string; code: string; errors?: Record<string, string[]> },
) {
  return http.post(
    '*/api/v1/pmms/projects/:projectId/:action',
    () =>
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

export function projectTerminateHandler(project: Project) {
  return http.post('*/api/v1/pmms/projects/:projectId/terminate', () =>
    HttpResponse.json({ data: project }),
  )
}

export function projectReopenHandler(project: Project) {
  return http.post('*/api/v1/pmms/projects/:projectId/reopen', () =>
    HttpResponse.json({ data: project }),
  )
}

export function projectReassignHandler(project: Project) {
  return http.post('*/api/v1/pmms/projects/:projectId/reassign', () =>
    HttpResponse.json({ data: project }),
  )
}

export function projectCorrectPlannedDatesHandler(project: Project) {
  return http.post(
    '*/api/v1/pmms/projects/:projectId/correct-planned-dates',
    () => HttpResponse.json({ data: project }),
  )
}

export function projectDeleteHandler() {
  return http.delete('*/api/v1/pmms/projects/:projectId', () =>
    new HttpResponse(null, { status: 204 }),
  )
}

export function assignableEngineersHandler(engineers: UserSummary[]) {
  return http.get('*/api/v1/pmms/assignable-engineers', () =>
    HttpResponse.json({ data: engineers }),
  )
}
