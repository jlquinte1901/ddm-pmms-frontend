import { createBrowserRouter } from 'react-router-dom'
import { PERMISSIONS } from '@/shared/lib/permissions'
import { RequireAuth } from '@/shared/auth/RequireAuth'
import { RequireGuest } from '@/shared/auth/RequireGuest'
import { RequirePermission } from '@/shared/auth/RequirePermission'
import { ChangePasswordPage } from '@/features/auth/pages/ChangePasswordPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/pmms/dashboard/pages/DashboardPage'
import { NewProjectPage } from '@/features/pmms/projects/pages/NewProjectPage'
import { EditProjectPage } from '@/features/pmms/projects/pages/EditProjectPage'
import { ProjectDetailPage } from '@/features/pmms/projects/pages/ProjectDetailPage'
import { ProjectsPage } from '@/features/pmms/projects/pages/ProjectsPage'
import { AppShell } from './layouts/AppShell'
import { LandingRedirect } from './pages/LandingRedirect'
import { NoAccessPage } from './pages/NoAccessPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { RouteErrorPage } from './RouteErrorPage'

const PROJECT_VIEW_PERMISSIONS = [
  PERMISSIONS.PMMS_PROJECTS_VIEW_ALL,
  PERMISSIONS.PMMS_PROJECTS_VIEW_OWN,
] as const

const DOWNLOAD_REQUEST_PERMISSIONS = [
  PERMISSIONS.DDM_DOCUMENTS_VIEW,
  PERMISSIONS.DDM_DOWNLOADS_REQUEST,
  PERMISSIONS.DDM_DOWNLOADS_APPROVE_RESTRICTED,
  PERMISSIONS.DDM_DOWNLOADS_APPROVE_CONFIDENTIAL,
] as const

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <RequireGuest>
        <LoginPage />
      </RequireGuest>
    ),
    errorElement: <RouteErrorPage />,
  },
  {
    path: '/',
    element: <RequireAuth />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <LandingRedirect />,
          },
          {
            path: 'no-access',
            element: <NoAccessPage />,
          },
          {
            path: 'account/password',
            element: <ChangePasswordPage />,
          },
          {
            path: 'pmms/dashboard',
            element: (
              <RequirePermission permission={PERMISSIONS.PMMS_DASHBOARD_VIEW}>
                <DashboardPage />
              </RequirePermission>
            ),
          },
          {
            path: 'pmms/projects',
            element: (
              <RequirePermission anyOf={PROJECT_VIEW_PERMISSIONS}>
                <ProjectsPage />
              </RequirePermission>
            ),
          },
          {
            path: 'pmms/projects/new',
            element: (
              <RequirePermission permission={PERMISSIONS.PMMS_PROJECTS_CREATE}>
                <NewProjectPage />
              </RequirePermission>
            ),
          },
          {
            path: 'pmms/projects/:projectId',
            element: (
              <RequirePermission anyOf={PROJECT_VIEW_PERMISSIONS}>
                <ProjectDetailPage />
              </RequirePermission>
            ),
          },
          {
            path: 'pmms/projects/:projectId/edit',
            element: (
              <RequirePermission permission={PERMISSIONS.PMMS_PROJECTS_MANAGE_OWN}>
                <EditProjectPage />
              </RequirePermission>
            ),
          },
          {
            path: 'pmms/reports',
            element: (
              <RequirePermission permission={PERMISSIONS.PMMS_REPORTS_VIEW}>
                <PlaceholderPage
                  title="PMMS reports"
                  description="Filtered project summaries and CSV export."
                />
              </RequirePermission>
            ),
          },
          {
            path: 'ddm/documents',
            element: (
              <RequirePermission permission={PERMISSIONS.DDM_DOCUMENTS_VIEW}>
                <PlaceholderPage
                  title="Documents"
                  description="The departmental document repository and search."
                />
              </RequirePermission>
            ),
          },
          {
            path: 'ddm/categories',
            element: (
              <RequirePermission permission={PERMISSIONS.DDM_CATEGORIES_MANAGE}>
                <PlaceholderPage
                  title="Document categories"
                  description="Document category management and default access levels."
                />
              </RequirePermission>
            ),
          },
          {
            path: 'ddm/download-requests',
            element: (
              <RequirePermission anyOf={DOWNLOAD_REQUEST_PERMISSIONS}>
                <PlaceholderPage
                  title="Download requests"
                  description="Your requests and the approval queue."
                />
              </RequirePermission>
            ),
          },
          {
            path: 'admin/users',
            element: (
              <RequirePermission permission={PERMISSIONS.USERS_MANAGE}>
                <PlaceholderPage
                  title="Users"
                  description="User administration, roles, and per-user Viewer access."
                />
              </RequirePermission>
            ),
          },
          {
            path: 'admin/roles',
            element: (
              <RequirePermission permission={PERMISSIONS.ROLES_MANAGE}>
                <PlaceholderPage
                  title="Roles and permissions"
                  description="The registered roles and their permissions."
                />
              </RequirePermission>
            ),
          },
          {
            path: 'admin/audit-logs',
            element: (
              <RequirePermission permission={PERMISSIONS.AUDIT_VIEW}>
                <PlaceholderPage
                  title="Audit trail"
                  description="Read-only system audit records across the modules."
                />
              </RequirePermission>
            ),
          },
          {
            path: '*',
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
])
