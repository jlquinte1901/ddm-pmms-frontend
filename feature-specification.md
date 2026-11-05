# Feature Specifications — DDM-PMMS Frontend

**Status:** proposed. Each feature lists purpose, users, screens, behavior, states, and acceptance criteria. Implement only the features the user approves for the current stage (`development-workflow.md`). Endpoints are in `api-contracts.md`.

**Read with:** `AGENTS.md` sections 3 to 7 and 13, `design-system.md`, `frontend-guidelines.md`.

## 0. Roles at a glance (frontend view)

| Role | Frontend capability |
| --- | --- |
| Super Admin | Users, roles, per-user grants, audit trail, confidential approvals, document soft-delete and undelete, direct downloads (logged), plus Admin abilities. |
| Admin | Runs DDM (upload, versions, metadata, archive, restore), approves restricted requests, views all PMMS projects, administer actions. Cannot edit project data. |
| Project Engineer | Creates and maintains only his own projects: progress, pause, resume, supporting documents. Views DDM documents. |
| Viewer | Read-only, only the modules granted to them. Requests downloads like everyone else. |

The UI reads actual permissions from `GET /auth/me`. This table is for understanding, not for coding role checks.

## A. Shared Core

### A1. Login

- **Screen:** email and password form.
- **Behavior:** submit calls `POST /auth/login`, stores the token in `sessionStorage`, loads `GET /auth/me`, then goes to the user's landing page (PMMS dashboard if available, otherwise DDM documents, otherwise a "no access yet" page for a Viewer without grants).
- **Errors:** a generic message for bad credentials. On `429`, show a throttle notice and a short disabled period. Never say whether the email exists.
- **Acceptance:** token never logged or in a URL; `401` anywhere returns to login with a session-expired notice; a deactivated user cannot continue.

### A2. Session and account

- App load: if a token exists, call `/auth/me` before rendering protected routes. Show a loading shell meanwhile.
- Sign out clears the token and session and calls `POST /auth/logout`.
- Change password form: current password, new password (12 or more characters), confirmation. After success other sessions are revoked; show a notice.

### A3. User administration (`users.manage`)

- **List:** search, role and active filters, server pagination.
- **Create and edit:** name, email, role (`role_id` is allowed here), active state. One role per user.
- **Viewer access:** a panel to grant or remove DDM and PMMS module access for a Viewer.
- **Deactivate** instead of delete. No hard delete in the UI.
- **Acceptance:** changing a role or deactivating shows a notice that the user's sessions will end.

### A4. Roles and permissions view (`roles.manage`)

- Read-oriented view of roles and their permissions with clear module grouping. Editing follows only what the backend supports. Do not invent role editing beyond the API.

### A5. Audit trail (`audit.view`)

- **List:** actor, action, subject, time, IP. Filters: actor, action, date range. Server pagination.
- **Detail:** metadata shown as readable key and value pairs.
- Read-only. No edit, delete, or export from the UI unless the backend adds an audited export.
- **Acceptance:** users without `audit.view` never see the menu item, and a direct URL shows the forbidden state.

## B. DDM Module

### B1. Document list and search

- **Users:** all roles with `ddm.documents.view`.
- **Screen:** table with title, reference number, category, access level badge, latest version, archived flag, updated date, and a download state indicator.
- **Filters (server-side, in URL):** search text, category, access level, archived or active, date range, sort.
- **Behavior:** archived documents stay searchable. Soft-deleted documents appear only to Super Admin and are clearly marked.
- **Never** show project documents here.
- **Acceptance:** state components for loading, empty, error, forbidden; filters survive refresh; page size at most 100.

### B2. Upload document (`ddm.documents.upload`: Admin, Super Admin)

- **Form:** title, reference number, category, description, optional access-level override, file.
- **Validation hints:** PDF, Word, Excel, PowerPoint, JPEG, PNG; 50 MB. Server result is authoritative.
- **Behavior:** multipart upload with progress; on success go to the document detail.
- **Acceptance:** category default level is shown, and an override is labelled as an override.

### B3. Document detail and versions

- **Header:** title, category, access level, archived state, current version number.
- **Tabs:** Details, Versions, Activity (if the API provides it).
- **Versions:** newest first, current marked. Text states: "Uploading a new version keeps all earlier versions. Nothing is overwritten."
- **New version (Admin, Super Admin):** file and change note. Blocked with an explanation when the document is archived ("Restore the document to add a version").
- **Edit metadata:** Admin and Super Admin only.
- **Archive and restore:** Admin and Super Admin; clear, reversible wording.
- **Delete and undelete:** Super Admin only, requires a reason, separate danger styling.
- **Acceptance:** PEs and Viewers see no upload, version, archive, or delete controls.

### B4. Download and download requests

Rules the UI must express (decided and final):

- There is no open level. Every document is Restricted or Confidential.
- Every download needs an approved, unexpired request, except Super Admin (direct, logged) and the owning PE for his own project's documents (direct, logged).
- Being able to view a document never means being able to download it.
- Nobody approves his own request. Restricted requests are decided by any Admin. Confidential requests are decided by Super Admin only.

**Behaviors**

- **Download button** shown when `can_download` is true. Otherwise **Request download**.
- **Request dialog:** reason, 10 to 1000 characters; explains who reviews it (Admin for Restricted, Super Admin for Confidential).
- **Request states shown in the document:** pending (request date), approved (until date, then Download), denied (note), expired (offer to request again).
- **My requests page:** the user's requests with status; cancel a pending request.
- **Approval queue** (Admin for restricted, Super Admin for confidential): list of pending requests, document name and level, requester, reason, date. Approve (optional note and expiry in days, default 7, maximum 30) or Deny (note required). The user's own requests never appear as approvable.
- **Acceptance:** a `403 download_approval_required` always leads to the request flow; approval changes refresh the document's `can_download`; no storage path or public URL appears anywhere.

### B5. Categories (`ddm.categories.manage`)

- Table and form: name, scope (`ddm`), default access level (Restricted by default or Confidential), active state. No delete.

### B6. DDM reports (`ddm.reports.view`)

- Summary cards and tables: counts by category, access level, archive status; version information; download request summaries; activity.
- Filters apply server-side. CSV export through the API, with a notice that exports are logged.

## C. PMMS Module

### C1. Project list

- **Users:** Admin and Super Admin see all projects. A PE sees only his own (the API enforces this). A Viewer sees what the grant allows.
- **Columns:** project name, contract number, category, year, assigned PE (not shown to a PE), status badge, indicator badge with days, progress, planned and effective finish dates.
- **Filters (server-side, in URL):** search, year, category, status, indicator, fund source, region, LGU, contractor, assigned PE (only for users who can view all projects), sort.
- **Acceptance:** a PE never sees the PE filter; the list never filters client-side; indicator and days are exactly what the API returns.

### C2. Register project (PE only, `pmms.projects.create`)

- **Form fields:** category, implementation year, name, contract number (optional, not unique), location, region, LGU, department, implementing office, contract amount, revised amount, fund source, planned start, planned finish, contractor, project manager (display text), remarks.
- **Never** shows or sends the assigned PE. The server sets ownership to the signed-in PE.
- **Validation:** planned finish not before planned start; money as decimals.
- **Acceptance:** after success, open the project detail; a `422` maps to fields.

### C3. Project detail

- **Header:** name, status badge, indicator badge with days remaining (or days paused), progress bar.
- **Tabs:** Overview, Progress reports, History, Documents.
- **Overview:** all project fields, planned and revised finish dates with a label showing which drives the indicator.
- **Action area depends on role and status** (see C4 to C7). A project that is not the PE's own returns `404`; show the not-found state.

### C4. Edit project (owner PE)

- Edit project information. Planned dates are editable only while the project is `not_started`. After that they are shown read-only with the explanation "Planned dates can be corrected only by an administrator, with a reason."
- Ownership, status, progress, pause, completion, and revised-date fields are never part of this form.

### C5. Report progress (owner PE)

- **Form:** report date (not in the future), progress percentage (0 to 100), remarks.
- **Rules shown to the user:**
  - The same percentage may be submitted to explain a delay.
  - Lowering progress requires remarks.
  - Reporting 100% completes the project: show a confirmation ("This marks the project as completed.").
  - The first report moves a not-started project to ongoing (the server does this; the UI just reflects it).
- **Acceptance:** after success the status, indicator, history, and progress reports refresh from the server.

### C6. Pause and resume (owner PE)

- **Suspend or Postpone** (from not started or ongoing): choose which, give a reason (at least 10 characters). While paused the indicator is Paused and the page shows days paused. A short note explains that paused projects are not counted as Critical or Overdue.
- **Resume** (from suspended or postponed only): new finish date (not before today) and a remark. The status returns to ongoing.
- Only valid actions for the current status are offered.

### C7. Administer actions (`pmms.projects.administer`: Admin, Super Admin)

- A separate "Administer" menu with: Terminate, Reopen (completed or terminated), Reassign PE, Correct planned dates (after start), Delete, Restore.
- Every action uses `ReasonDialog` and states its consequence.
- **Reassign** needs a list of active PEs (see Gap 1 in `api-contracts.md`).
- Admin and Super Admin see no other edit controls on project data.
- **Acceptance:** PEs and Viewers never see the Administer menu.

### C8. Project history

- Chronological, read-only. Grouped by `change_set_id`: actor, action, time, reason, and before and after for each changed field.
- Money and dates formatted per `design-system.md`.
- No edit or delete.

### C9. Project documents

- Upload supporting documents (owner PE), view and versions, download (owner PE directly, logged; others by request), same shared components as DDM but PMMS endpoints.
- Project documents never appear in DDM screens.

### C10. Dashboard (`pmms.dashboard.view`)

- **Cards:** totals by status, counts for Normal, Critical, Overdue, Paused, Completed, Terminated. Each card links to the project list filtered the same way, so numbers reproduce in the list and reports.
- **Watchlist:** Critical and Overdue projects ordered by urgency, with days remaining.
- **Charts:** ApexCharts using indicator tokens, each with a table alternative.
- PEs see only their own numbers. The UI does not say this is filtered; it simply shows his data.
- Never recompute counts in the browser.

### C11. PMMS reports (`pmms.reports.view`)

- Filters identical to the project list. Group by an allowed field. Table plus CSV export through the API, with a notice that exports are logged.
- **Acceptance:** a dashboard number equals the matching report number for the same filters.

## D. Cross-cutting behavior

- **Notifications:** only in-app toasts for the user's own actions. No email, SMS, or push.
- **Empty states** explain what the screen is for and the next action when the user has one.
- **Session expiry** returns the user to login with a notice, without losing unsaved form data where practical **(Proposed)**.
- **Unsaved changes:** warn before leaving a form with unsaved input **(Proposed)**.

## E. Out of scope (do not build)

Notifications by email, SMS, or push; automatic progress calculation; automatic status changes from the indicator; permanent deletion or purge; CAD file upload; malware scanning; other export formats; role or permission invention beyond the API; scheduled jobs.

## F. Suggested build order

1. Foundation: app shell, API client, error normalizer, session store, route guards, shared state components.
2. Login, `/auth/me`, navigation by permission, change password.
3. DDM: categories, document list, upload, detail, versions, archive and restore.
4. DDM: download requests, approvals, direct download, soft delete (Super Admin).
5. PMMS: project list, register, detail, edit.
6. PMMS: progress, pause, resume, history.
7. PMMS: administer actions, project documents.
8. Dashboard and reports (PMMS, then DDM).
9. User administration, roles view, audit trail.
10. Integration pass: every role walked through every screen, accessibility pass, error-state pass.

Each stage is built only after the matching backend endpoints exist and the user approves that stage.