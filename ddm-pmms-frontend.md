# DDM-PMMS Frontend Engineering Guide

**Status:** proposed, reviewed against the current backend API on 2026-11-17. Items marked **(Proposed)** or **(Gap)** need the user's approval or an answer before work on them starts.

**What this file is:** the frontend counterpart of `ddm-pmms-backend.md`. It is the single list of everything the frontend will build (screens, dialogs, shared components, hooks, schemas, tests, build phases), plus the rules and decisions those things depend on.

**Precedence:** `AGENTS.md` wins. Then the detailed docs hold the specifics. This file is the inventory and summary. If it disagrees with one of them, fix this file.

| Detailed doc | Holds |
| --- | --- |
| `Architecture.md` | Layers, folder structure, state, auth flow, errors, routing |
| `Design-system.md` | Palette, tokens, badges, components, patterns, accessibility |
| `frontend-guidelines.md` | Coding rules, forms, testing, review checklist |
| `feature-specification.md` | Behavior and acceptance criteria for each feature |
| `api-contracts.md` | Error format, TypeScript types, endpoints, gaps |
| `development-workflow.md` | Task steps, definition of done, open decisions |

## 1. Project snapshot (what the UI depends on)

DDM-PMMS is one platform for the City Engineering Department, Data Management Section, with two separate modules: **DDM** (departmental documents) and **PMMS** (construction project monitoring), sharing a **Shared Core** (auth, users, roles, permissions, audit).

| Role | What the frontend shows them |
| --- | --- |
| Super Admin | Users, roles, per-user grants, audit trail, confidential approvals, document soft-delete, direct downloads, plus Admin abilities |
| Admin | DDM operations (upload, versions, metadata, archive, unarchive), restricted approvals, all PMMS projects, registered administer actions. Cannot edit project data. |
| Project Engineer (PE) | Only his own projects: register, edit, progress, start, pause, resume. PMMS project documents are blocked pending backend routes. Views DDM documents. |
| Viewer | Read-only, only the modules Super Admin granted. Requests downloads |

**Rules the UI must express (final):**

1. The backend is the security authority. Hidden controls are a convenience only.
2. Permissions come from `GET /auth/me`. No hardcoded role names or IDs.
3. Never send ownership or identity fields (`assigned_pe_id` only in the reassign dialog, `role_id` only in user administration).
4. Show the API's `indicator` and `days_remaining`. Never recompute the 35-day rule.
5. Status (lifecycle) and indicator (monitoring) are different things and use different badges.
6. Pausing needs a reason. Resuming needs a new finish date and `remarks`. Lowering progress needs remarks. 100% completes the project (confirm first). Planned dates are editable only while not started; no post-start correction route is currently registered.
7. Every document is Restricted or Confidential (no open level). Every download needs an approved, unexpired request, except Super Admin and the owning PE for his own project's documents (direct, logged). Viewing never implies downloading. Nobody approves his own request.
8. Archive and delete are different actions. Only Super Admin sees delete. New uploads create new versions and never overwrite.
9. Filters, sorting, and pagination are server-side and live in the URL.
10. Token in `sessionStorage` (decision 20), cleared on logout and any `401`, never in a URL or log. Downloads use authenticated blob requests.
11. Out of scope: email, SMS, or push notifications, automatic progress, automatic status changes, permanent deletion, CAD uploads, non-CSV exports.

## 2. Stack and status

Verify installed versions in `package.json` before relying on any API. Do not install anything without approval.

| Piece | Choice | Status |
| --- | --- | --- |
| Framework | React 19 + TypeScript, Vite (`react-ts` template) | Approved |
| UI | shadcn/ui + Tailwind CSS | Approved 2026-11-04 |
| Palette and layout | Figma mockups (blue app bar, tab row, status pills) | Approved direction 2026-11-05; contrast adjustments need approval |
| Routing | React Router | Intended |
| HTTP | Axios | Intended |
| Server state | TanStack Query | Intended |
| Client state | Zustand (session only) | Intended |
| Forms | React Hook Form + Zod | Intended |
| Tables | TanStack Table | Intended |
| Charts | ApexCharts | Intended |
| Icons | Lucide (`lucide-react` is installed) | Installed; use consistently |
| Tests | Vitest, React Testing Library, MSW | Approved and installed |
| API types | Hand-written from `api-contracts.md` | (Proposed) |

**Install timing (needs approval):** install an additional library only when the first approved slice needs it. Do not scaffold or reinitialize the existing project. Tailwind CSS, shadcn/ui, the `@/` alias, and the Button component are already present; inspect and extend the current setup as needed. The test stack remains proposed and requires approval before installation.

## 3. Folder structure (Proposed)

Use only if the repository has none. Inspect first. shadcn's `components.json` can point at `src/shared/components/ui` so everything shared sits under `shared/`.

```text
src/
  app/        providers, router, layouts (AuthLayout, AppShell), error boundary
  shared/
    api/        axios client, interceptors, error normalizer, query client, pagination types
    auth/       authStore, usePermission, <Can>, route guards, permission constants
    components/ ui/ (shadcn), plus shared composites (section 5)
    hooks/      useDebounce, useUrlFilters
    lib/        formatters, enums, constants
    types/      shared types
  features/
    auth/  users/  audit/
    ddm/  documents/  categories/  download-requests/  reports/
    pmms/ projects/  progress/  history/  project-documents/  dashboard/  reports/
```

Each feature folder: `api/`, `hooks/`, `components/`, `schemas/`, `types.ts`, `routes.tsx`, `index.ts`. `features/ddm` and `features/pmms` never import each other.

## 4. Screens to build (17)

"Mockup" shows whether the Figma board has a design for it. Where it says "No", the screen follows `Design-system.md` components and the same visual style.

| ID | Screen | Route | Permission | Spec | Mockup |
| --- | --- | --- | --- | --- | --- |
| S-01 | Login | `/login` | Public | A1 | Yes |
| S-02 | Change password (blocked pending backend route) | `/account/password` | Signed in | A2 | No |
| S-03 | Status pages: Not found, Forbidden, No access yet | any | n/a | D | No |
| S-04 | User administration (list, create, edit, Viewer access) | `/admin/users` | `users.manage` | A3 | Yes (list) |
| S-05 | Roles and permissions (read view) | `/admin/roles` | `roles.manage` | A4 | No |
| S-06 | Audit trail (list, filters, detail) | `/admin/audit-logs` | `audit.view` | A5 | No |
| S-07 | DDM document list and search | `/ddm/documents` | `ddm.documents.view` | B1 | No |
| S-08 | Upload document | `/ddm/documents/new` | `ddm.documents.upload` | B2 | No |
| S-09 | Document detail (Details, Versions) | `/ddm/documents/:id` | `ddm.documents.view` | B3 | No |
| S-10 | Download requests (My requests, Approval queue) | `/ddm/download-requests` | request or approve permission | B4 | No |
| S-11 | DDM categories | `/ddm/categories` | `ddm.categories.manage` | B5 | No |
| S-12 | DDM reports (blocked pending backend routes) | `/ddm/reports` | `ddm.reports.view` | B6 | Partly (Reports frame) |
| S-13 | PMMS dashboard and watchlist | `/pmms/dashboard` | `pmms.dashboard.view` | C10 | Yes |
| S-14 | Project list | `/pmms/projects` | `pmms.projects.view-all` or `pmms.projects.view-own` | C1 | Yes |
| S-15 | Register project | `/pmms/projects/new` | `pmms.projects.create` | C2 | No |
| S-16 | Project detail (Overview, Progress, History; Documents blocked) | `/pmms/projects/:id` | `pmms.projects.view-all` or `pmms.projects.view-own`; API enforces project scope and returns 404 when out of scope | C3 to C9 | No |
| S-17 | PMMS reports | `/pmms/reports` | `pmms.reports.view` | C11 | Yes |

**Layouts (2):** `AuthLayout` (login) and `AppShell` (blue app bar with hamburger, seal, department name and user menu; white tab row; page area). Navigation tabs are built from the user's permissions.

## 5. Shared components to build

Specs are in `Design-system.md` section 6.

| # | Component | Used by |
| --- | --- | --- |
| 1 | `AppShell`, `AppBar`, `TabNav`, `NavDrawer` | All signed-in screens |
| 2 | `PageHeader`, `Breadcrumbs` | All screens |
| 3 | `DataTable` (TanStack Table, server-side) | All lists |
| 4 | `FilterBar` (URL-driven, removable chips) | All lists and reports |
| 5 | `SearchInput` (debounced) | Lists |
| 6 | `PaginationBar` | All lists |
| 7 | `StatusBadge` (solid pill) | Projects |
| 8 | `IndicatorBadge` (tinted pill with icon) | Projects, dashboard, reports |
| 9 | `AccessLevelBadge` | Documents |
| 10 | `ProgressBar` | Projects, dashboard |
| 11 | `StatCard` | Dashboard, reports |
| 12 | `ReasonDialog` | Administer actions, pause, resume, delete |
| 13 | `ConfirmDialog` | Complete at 100%, archive |
| 14 | `FileUpload` | Documents and versions |
| 15 | `VersionList` | DDM document detail; historical versions are displayed but cannot be downloaded individually |
| 16 | `DocumentTable` (shared/components/documents) | DDM list; reuse for project documents only after backend routes exist |
| 17 | `RequestDownloadDialog` | Documents |
| 18 | `HistoryTimeline` | Project detail |
| 19 | `Can` and route guard (`RequirePermission`) | Navigation, actions, routes |
| 20 | `EmptyState`, `ErrorState`, `ForbiddenState`, `NotFoundState` | Every data view |
| 21 | `Skeleton` set (table, card, detail) | Every data view |
| 22 | `Toast` host | Mutations |
| 23 | Chart wrappers: `StatusDonut`, `BarChart`, `HorizontalBarChart`, each with a table alternative | Dashboard, reports |
| 24 | `ErrorBoundary` per route | App |

## 6. Dialogs and forms to build (20)

| ID | Dialog or form | Fields | Rule |
| --- | --- | --- | --- |
| D-01 | Login form | email, password | Generic error, throttle notice |
| D-02 | Change password (blocked) | current, new, confirm | Build only after backend route and validation are verified |
| D-03 | Create or edit user | name, email, role, active | `role_id` allowed here only |
| D-04 | Viewer module access | DDM, PMMS toggles | Super Admin |
| D-05 | Category form | name, scope, default access level, active | No delete |
| D-06 | Upload document | title, reference, category, description, level override, file | 50 MB, allowed types |
| D-07 | Edit document metadata | same fields | Admin, Super Admin |
| D-08 | Upload new version | file, change note | Blocked when archived |
| D-09 | Archive or unarchive document | Confirmation | Current endpoints require no reason |
| D-10 | Delete or undelete document | reason | Super Admin only, danger style |
| D-11 | Request download | reason (10 to 1000) | Names who reviews it |
| D-12 | Approve request | optional note, approval days (maximum 30) | Use backend default only after verifying it; not own request |
| D-13 | Deny request | note | |
| D-14 | Register or edit project | all project fields | No owner field. Planned dates only while not started |
| D-15 | Report progress | report date, percentage, remarks | Lowering needs remarks. 100% asks to confirm completion |
| D-16 | Suspend or postpone | which, reason (10+ characters) | Not counted as Critical or Overdue |
| D-17 | Resume | `revised_finish_date` (not before today), `remarks` | |
| D-18 | Terminate or reopen project | `reason`; reopen also needs `progress_percentage` (0–99) | Administer |
| D-19 | Reassign PE (blocked) | PE select, reason | No active-PE list endpoint is registered |
| D-20 | Correct planned dates (blocked), or delete/restore project | dates and reason, or reason | No date-correction endpoint; delete/restore are registered |

## 7. Feature modules: API functions, hooks, schemas

Endpoints are in `api-contracts.md` section 4. Names follow `frontend-guidelines.md` section 3.

| Feature | Queries | Mutations | Zod schemas |
| --- | --- | --- | --- |
| auth | `useMeQuery` | `useLoginMutation`, `useLogoutMutation`; change password is blocked pending a route | `loginSchema`; change-password schema follows the backend contract |
| users | `useUsersQuery`, `useUserQuery`, `useRolesQuery`, `usePermissionsQuery` | `useCreateUserMutation`, `useUpdateUserMutation`, `useSetUserAccessMutation` | `userSchema`, `userAccessSchema` |
| audit | `useAuditLogsQuery` | none (read-only) | filter schema |
| ddm/documents | `useDocumentsQuery`, `useDocumentQuery` (versions embedded in detail) | `useCreateDocumentMutation`, `useUpdateDocumentMutation`, `useUploadVersionMutation`, `useArchiveDocumentMutation`, `useUnarchiveDocumentMutation`, `useDeleteDocumentMutation`, `useUndeleteDocumentMutation`, `useDownloadDocumentMutation` (current version, blob) | `documentSchema`, `versionUploadSchema`, `reasonSchema` |
| ddm/categories | `useCategoriesQuery` | create and update category | `categorySchema` |
| ddm/download-requests | `useDownloadRequestsQuery` | `useRequestDownloadMutation`, `useApproveRequestMutation`, `useDenyRequestMutation` (no cancel route) | `requestDownloadSchema`, `approveSchema`, `denySchema` |
| ddm/reports (blocked) | No registered report query | No registered DDM export | Define after backend contract exists |
| pmms/projects | `useProjectsQuery`, `useProjectQuery`, `useProjectCategoriesQuery`; active PE list is blocked | `useCreateProjectMutation`, `useUpdateProjectMutation` | `projectCreateSchema`, `projectEditSchema`, filter schema |
| pmms/progress | `useProjectUpdatesQuery` | `useSubmitProgressMutation`, `usePauseProjectMutation`, `useResumeProjectMutation` | `progressSchema`, `pauseSchema`, `resumeSchema` |
| pmms/history | `useProjectHistoryQuery` | none (read-only) | none |
| pmms/administer | none | terminate, reopen, reassign, delete, restore; reassignment lacks a PE-list route, date correction is unavailable | `reasonSchema`, `reassignSchema` |
| pmms/project-documents (blocked) | No registered project-document routes | No registered upload/download routes | Define after backend contract exists |
| pmms/dashboard | `useDashboardQuery` | none | none |
| pmms/reports | `useProjectReportQuery` | `exportProjectReport` (CSV) | filter schema |

**Shared building blocks:** `apiClient` (base `/api/v1`, Bearer token, error normalizer into `ApiError`), `queryClient`, per-feature query-key factories, `useUrlFilters`, `usePermission`, `PERMISSIONS` constants, formatters (`formatMoney`, `formatDate`, `formatDateTime`, `formatBytes`, `formatDays`), enums (`ProjectStatus`, `Indicator`, `AccessLevel`, `RequestStatus`) and the types in `api-contracts.md` section 3.

**Stores:** one only, `authStore` (token in `sessionStorage`, user and permissions re-fetched from `/auth/me`). No stores for server data.

## 8. Tests to write

Use the test stack once approved. Tests live next to the code and are written inside each slice.

| Area | What to prove |
| --- | --- |
| Permissions | Navigation and actions per role (Super Admin, Admin, PE, Viewer with and without grants). Direct URL to a forbidden screen shows the forbidden state |
| Auth | Token stored in `sessionStorage` only, cleared on logout and `401`. Login errors generic. `429` shows throttle notice |
| Project lifecycle | Only valid actions per status. Reasons required. Resume date rule. Confirm at 100%. Lowering progress needs remarks |
| Administer | Menu visible only with `pmms.projects.administer`. Admin and Super Admin see no edit controls |
| Indicator | UI shows exactly what the API sends for all six indicators, never recomputes |
| Ownership | PE sees no assigned-PE filter. No ownership fields in any request body |
| Documents | Upload validation hints, version message, archive vs delete wording, Super Admin-only delete |
| Download flow | `can_download` true shows Download. False shows Request. `403 download_approval_required` opens the dialog. Pending, approved, denied, expired states. Own requests never approvable |
| Errors | `401`, `403`, `404`, `409`, `422` (field mapping), `429`, `500` |
| Filters | Changes update the URL and the request. Page size at most 100 |
| Forms | Client validation and server field errors |
| Accessibility | Dialog focus, labels, icon-only button names, no state by color alone |

## 9. Build phases

Each phase is built only after the user approves it and the matching backend endpoints exist (or mocks are marked as mocks). Phases follow the backend module order from `AGENTS.md`. Because the mockups cover PMMS, Users, and Reports, the user may reorder the phases.

- [x] **Phase 0. Setup review**: inspect and preserve the existing Vite, Tailwind, `@/` alias, and shadcn setup; reconcile design tokens and available scripts. Approval is required before adding dependencies or test tooling.
- [x] **Phase 1. Foundation:** API client, error normalizer, query client, `authStore`, `usePermission`, `Can`, route guards, formatters, `useUrlFilters`, state components, toasts, error boundary
- [x] **Phase 2. Auth and shell:** S-01, S-03, `AuthLayout`, `AppShell`, permission-driven navigation. Keep S-02 blocked until the password route exists.

Phases 0 to 2 were implemented and verified on 2026-11-17. A live login against the backend still needs MySQL and the Laravel API running.
- [ ] **Phase 3. DDM documents:** S-11, S-07, S-08, S-09 (versions, archive, restore, metadata)
- [ ] **Phase 4. DDM downloads:** S-10, request, approve, deny, direct download, document soft-delete. No cancel action until a route exists.
- [ ] **Phase 5. PMMS read:** S-14, S-16 (Overview, History), S-13 dashboard. Keep project Documents blocked.
- [ ] **Phase 6. PMMS PE writes:** S-15, edit, progress, pause, resume
- [ ] **Phase 7. PMMS administer and project documents:** registered terminate/reopen/reassign/delete/restore actions; reassignment waits on an active-PE list, date correction and project documents remain blocked.
- [ ] **Phase 8. Reports:** S-17 and PMMS CSV export. Keep S-12 and DDM CSV exports blocked until backend routes exist.
- [ ] **Phase 9. Admin:** S-04, S-05, S-06
- [ ] **Phase 10. Integration pass:** every role through every screen, error states, accessibility, build check

## 10. Mockup reconciliation

The Figma board shows login, Superadmin dashboard, Projects, User Management, Reports, a hamburger menu, and a second green-sidebar dashboard variant. Small text in the exported image was hard to read, so confirm these against Figma.

| # | What the mockup shows | Issue | Proposed handling |
| --- | --- | --- | --- |
| 1 | Login asks for "Username" | The API logs in with email | Label it "Email" (confirmed and implemented) |
| 2 | Login title "Document Monitoring System" | Product name is DDM-PMMS | Confirm the display name |
| 3 | Projects rows show three action icons (blue, orange, red) and an Add Project button | Admin and Super Admin cannot edit projects. Only PEs add and edit. No hard delete | Row actions by role: PE edit and pause. Admin and Super Admin only an Administer menu. Add Project for PEs only |
| 4 | User rows show edit, warning, and delete icons | Users are deactivated, never deleted | Replace delete with Deactivate |
| 5 | Status "On-going" | API value is `ongoing` | Label "Ongoing" or keep "On-going" **(confirm)** |
| 6 | Hamburger menu lists Dashboard, Projects, Report, Settings, Logout | "Settings" has no specification | Drop it, or specify it **(confirm)** |
| 7 | Top tabs: Dashboard, Projects, Users, Reports | No DDM tab | Add Documents and Download requests tabs, and Audit under admin **(Proposed)** |
| 8 | Dashboard cards: Completed, On-going, Suspended or Postponed, Terminated | Critical and Overdue counts appear only as a banner and watchlist | Cards show status counts. Banner and watchlist show indicator counts. Both from `GET /pmms/dashboard` |
| 9 | Reports include a chart "Top contributors (most upload document)" and one named "Workload per engineer" on the dashboard | No endpoint in the contract for either | Ask the backend owner whether to add them, or leave them out |
| 10 | Dashboard and reports show progress charts and a status donut | Orange on white is 2.2:1 | Legends, data labels, and a table alternative |
| 11 | Green-sidebar dashboard in a corner of the board | A second visual direction | Not used unless the user says so |

## 11. Open items

**API gaps** (`api-contracts.md` section 4; `development-workflow.md` section 10): active-PE listing, PMMS project documents/categories, post-start date correction, change password, DDM reports/exports, cancellation of a pending download request, historical-version download, project contract-number uniqueness conflict, and runtime verification of response envelopes/error formats. The registered API paths, filters, request/resource field names, and archive/unarchive reason behavior are documented in `api-contracts.md`; do not re-open them as unknowns.

**Decisions** (`development-workflow.md` section 11): test stack, API type source, folder structure, currency (₱) and date format, responsive scope (desktop first, tablet usable), language, contrast adjustments to the palette, logo and font, dark mode (not now), and unsaved-changes warning. Backend route gaps are listed separately in section 10 of that document.

## 12. How to use this file with an agent

Give the assistant the item ID and the stage approval. Example:

> Implement S-14 Project list and D-14 for Phase 5. The endpoint is ready. Use shadcn/ui and the Figma palette. Follow `ddm-pmms-frontend.md` and the linked docs. Tell me which checks you ran.

The assistant answers in the order in `development-workflow.md` section 2a, then builds only that slice. Each slice needs all five states (loading, empty, error, forbidden or not found, success), permission gating, tests, and a passing lint, type-check, and test run before it is called done.
