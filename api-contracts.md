# API Contracts — DDM-PMMS (Frontend View)

**Status:** current implementation map, checked against `ddm-pmms-backend/routes/api.php`, its Form Requests, controllers, and API Resources on 2026-11-17. This file records routes and behavior that exist in the backend now. The backend design and registered implementation do not always agree; those differences are called out as blockers below. Do not treat an unregistered route as available or add one to the frontend by assumption.

**Read with:** `Architecture.md`, `frontend-guidelines.md`, `feature-specification.md`.

## 1. Conventions

- Base path: `/api/v1`. Auth: `Authorization: Bearer <token>`. JSON requests, except uploads (`multipart/form-data`).
- IDs are unsigned integers. Money is a decimal string (`"1250000.00"`). Dates are `YYYY-MM-DD`. Timestamps are ISO 8601 in `Asia/Manila`.
- Laravel API Resource collections are paginated as `{ data, links, meta }`; single API Resources are wrapped in `{ data }`, while raw `JsonResponse` endpoints return their documented object directly. A `204 No Content` response has no body. Do not assume one response envelope for every route.
- Filters, `sort`, and `group_by` use fixed allow-lists on the server. Send only documented values.
- Do not send ownership or identity fields (see `frontend-guidelines.md` section 1).
- A PE is always limited to his own projects by the server, whatever filters are sent.

## 2. Error format

```json
{ "message": "Human-readable summary", "code": "validation_failed", "errors": { "field": ["Message"] } }
```

`errors` may be empty. Stable codes the frontend handles:

| HTTP | `code` | Meaning |
| --- | --- | --- |
| 401 | `unauthenticated` | Missing, expired, or revoked token |
| 403 | `forbidden` | Not allowed |
| 403 | `download_approval_required` | Download needs an approved, unexpired request |
| 404 | `not_found` | Missing or out of scope (also an out-of-scope PE project) |
| 409 | `state_conflict` | Action not valid in the current state |
| 422 | `validation_failed` | Field errors in `errors` |
| 429 | `too_many_requests` | Throttled |
| 500 | `server_error` | Unexpected |
| 404/409 | `file_missing` | Stored file not found (treated as a server-side data problem) |

Treat unknown codes by HTTP status.

## 3. TypeScript types

```ts
export type RoleName = 'super_admin' | 'admin' | 'project_engineer' | 'viewer';

export type ProjectStatus =
  | 'not_started' | 'ongoing' | 'suspended' | 'postponed' | 'completed' | 'terminated';

export type Indicator =
  | 'normal' | 'critical' | 'overdue' | 'paused' | 'completed' | 'terminated';

export type AccessLevel = 'restricted' | 'confidential';
export type RequestStatus = 'pending' | 'approved' | 'denied' | 'cancelled';
export type EffectiveRequestStatus = RequestStatus | 'lapsed' | 'expired';

export type ApiErrorBody = {
  message: string;
  code: string;
  errors: Record<string, string[]>;
};

export type Paginated<T> = {
  data: T[];
  links: { first: string | null; last: string | null; prev: string | null; next: string | null };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
};

export type Permission = {
  id: number;
  name: string;
  module: string;
  is_system: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type Role = {
  id: number;
  name: string;
  label: string;
  is_system: boolean;
  permissions?: Permission[];
  permissions_count?: number;
  created_at: string | null;
  updated_at: string | null;
};

export type AuthUser = {
  id: number;
  full_name: string;
  email: string;
  section: string | null;
  is_active: boolean;
  last_login_at: string | null;
  role: Role | null;
  permissions: Permission[];
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
};

export type Project = {
  id: number;
  project_category_id: number;
  category?: { id: number; name: string; is_active: boolean } | null;
  assigned_pe_id: number;
  assigned_pe?: { id: number; full_name: string };
  created_by: number;
  creator?: { id: number; full_name: string };
  implementation_year: number;
  project_name: string;
  contract_number: string | null;
  location: string | null;
  region: string | null;
  lgu: string | null;
  department: string | null;
  implementing_office: string | null;
  contract_amount: string;
  revised_amount: string | null;
  fund_source: string | null;
  planned_start_date: string;
  planned_finish_date: string;
  revised_finish_date: string | null;
  effective_finish_date: string;
  actual_start_date: string | null;
  actual_finish_date: string | null;
  project_manager: string | null; // display text only
  contractor: string | null;
  status: ProjectStatus;
  progress_percentage: number;     // 0 to 100
  paused_since: string | null;
  completed_at: string | null;
  indicator: Indicator;            // computed by the server
  days_remaining: number | null;   // computed by the server, negative when overdue
  days_paused: number | null;
  remarks: string | null;
  deleted_at: string | null;
  status_label: string;
  indicator_label: string;
  created_at: string;
  updated_at: string;
};

export type ProjectUpdate = {
  id: number;
  report_date: string;
  progress_percentage: number;
  previous_progress: number;
  accomplishment: string | null;
  remarks: string | null;
  reporter?: { id: number; full_name: string };
  created_at: string;
};

export type ProjectHistoryEntry = {
  id: number;
  change_set_id: string | null;
  action: string;
  field_name: string | null;
  previous_value: unknown;
  new_value: unknown;
  reason: string | null;
  actor?: { id: number; full_name: string };
  created_at: string;
};

export type DocumentCategory = {
  id: number;
  name: string;
  scope: 'ddm' | 'pmms';
  default_access_level: AccessLevel;
  is_active: boolean;
  documents_count?: number;
  projects_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export type DocumentVersion = {
  id: number;
  document_id: number;
  version_number: number;
  original_name: string;
  file_size: number;
  mime_type: string;
  checksum_sha256: string;
  change_note: string | null;
  uploaded_by: number;
  uploader?: { id: number; full_name: string };
  created_at: string;
};

export type DdmDocument = {
  id: number;
  category: DocumentCategory;
  title: string;
  reference_no: string | null;
  document_date: string | null;
  description: string | null;
  remarks: string | null;
  access_level: AccessLevel | null; // nullable category override
  effective_access_level: AccessLevel;
  state: 'active' | 'archived' | 'deleted';
  latest_version_number: number;
  latest_version: DocumentVersion | null;
  versions: DocumentVersion[];
  is_archived: boolean;
  archived_at: string | null;
  archived_by: number | null;
  created_by: number;
  creator?: { id: number; full_name: string };
  can_download: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type DownloadRequest = {
  id: number;
  document_id: number;
  document?: {
    id: number;
    title: string;
    reference_no: string | null;
    effective_access_level: AccessLevel;
    state: 'active' | 'archived' | 'deleted';
  };
  requested_by: number;
  requester?: { id: number; full_name: string };
  decided_by: number | null;
  decider?: { id: number; full_name: string } | null;
  reason: string;
  status: RequestStatus;
  effective_status: EffectiveRequestStatus;
  is_lapsed: boolean;
  is_expired: boolean;
  decision_note: string | null;
  decided_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditLogEntry = {
  id: number;
  module: 'shared' | 'ddm' | 'pmms';
  action: string;
  auditable_type: string | null;
  auditable_id: number | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  context: Record<string, unknown> | null;
  ip_address: string | null;
  request_id: string | null;
  user?: AuthUser | null;
  created_at: string;
};
```

These types reflect the current backend Resources inspected on 2026-11-17. Optional resource relationships are emitted only when the controller eager-loads them. The backend does not currently return a document-specific `download_request` field or a `DocumentVersion.is_current` field; derive neither in the client unless a documented endpoint supplies it. Dashboard and report JSON response details are described in section 4 and still need response-level tests before being treated as generated/static API types.

## 4. Registered backend endpoints

These are the routes currently registered in `ddm-pmms-backend/routes/api.php`; paths below include the `/api/v1` prefix. All routes except `POST /api/v1/auth/login` require Sanctum authentication and an active user. Permission names below are the backend's current `PermissionName` values. A route permission allows reaching an endpoint; the backend may apply additional ownership, state, and document-access checks.

### 4.1 Shared Core

| Method and path | Backend gate | Request / behavior |
| --- | --- | --- |
| `POST /api/v1/auth/login` | Public; throttled | `email`, `password`, optional `device_name`; returns `token`, `token_type`, `expires_at`, `user`. |
| `GET /api/v1/auth/me` | Authenticated, active user | Current user Resource with role and effective permissions. |
| `POST /api/v1/auth/logout` | Authenticated, active user | Revokes current token; `204`. |
| `GET /api/v1/users` | `users.manage` | Filters: `search`, `role_id`, `is_active`, `trashed`, `per_page`. |
| `POST /api/v1/users` | `users.manage` | Create user; see `StoreUserRequest`. |
| `GET /api/v1/users/{user}` | `users.manage` | User Resource. |
| `PUT`, `PATCH /api/v1/users/{user}` | `users.manage` | Update user; see `UpdateUserRequest`. |
| `DELETE /api/v1/users/{user}` | `users.manage` | Soft-deletes user; `204`. UI should continue to use deactivate unless deletion is explicitly approved. |
| `POST /api/v1/users/{user}/restore` | `users.manage` | Restores soft-deleted user. |
| `POST /api/v1/users/{user}/activate`, `/deactivate` | `users.manage` | Changes active state. |
| `PUT /api/v1/users/{user}/permissions` | `users.manage` | Body: `{ "permissions": number[] }`. |
| `GET`, `POST /api/v1/roles` | `roles.manage` | Paginated list or create role. |
| `GET /api/v1/roles/{role}` | `roles.manage` | Role Resource; detail includes permissions. |
| `PUT`, `PATCH /api/v1/roles/{role}` | `roles.manage` | Update role. |
| `DELETE /api/v1/roles/{role}` | `roles.manage` | Delete role; `204`. |
| `PUT /api/v1/roles/{role}/permissions` | `roles.manage` | Sync role permissions; verify request body in `SyncRolePermissionsRequest` before wiring. |
| `GET`, `POST /api/v1/permissions` | `roles.manage` | Paginated list or create permission. |
| `GET /api/v1/permissions/{permission}` | `roles.manage` | Permission Resource. |
| `PUT`, `PATCH /api/v1/permissions/{permission}` | `roles.manage` | Update permission. |
| `DELETE /api/v1/permissions/{permission}` | `roles.manage` | Delete permission; `204`. |
| `GET /api/v1/audit-logs` | `audit.view` | Filters: `user_id`, `module`, `action`, `auditable_type`, `auditable_id`, `from`, `to`, `per_page`. |
| `GET /api/v1/audit-logs/{auditLog}` | `audit.view` | AuditLog Resource. |

`POST /api/v1/auth/change-password` is **not registered**. Do not wire the change-password form to this assumed path until the backend adds and verifies it.

### 4.2 DDM

| Method and path | Backend gate | Request / behavior |
| --- | --- | --- |
| `GET /api/v1/ddm/categories`, `/categories/{ddmCategory}` | `ddm.documents.view` | Category list accepts `q`, `is_active`, `per_page`; detail returns a category Resource. |
| `POST /api/v1/ddm/categories` | `ddm.categories.manage` | Create category. |
| `PUT`, `PATCH /api/v1/ddm/categories/{ddmCategory}` | `ddm.categories.manage` | Update category. |
| `GET /api/v1/ddm/documents` | `ddm.documents.view` | Filters: `q`, `category_id`, `access_level`, `state` (`active`, `archived`, `deleted`, `all`), `uploader`, `reference_no`, `date_from`, `date_to`, `per_page`. Deleted state also requires `ddm.documents.delete`. Never returns project documents. |
| `GET /api/v1/ddm/documents/{ddmDocument}` | `ddm.documents.view` | Document Resource includes `versions` and `latest_version`; there is no separate versions-list route. |
| `POST /api/v1/ddm/documents` | `ddm.documents.upload` | Multipart: required `category_id`, `title`, `file`; optional `reference_no`, `document_date`, `description`, `remarks`, `access_level`. Returns `201` and Document Resource. |
| `PUT`, `PATCH /api/v1/ddm/documents/{ddmDocument}` | `ddm.documents.upload` | Metadata update; see `UpdateDocumentRequest`. |
| `POST /api/v1/ddm/documents/{ddmDocument}/versions` | `ddm.documents.upload` | Multipart: `file`, optional `change_note`; returns `201` and DocumentVersion Resource. |
| `GET /api/v1/ddm/documents/{ddmDocument}/download` | `ddm.documents.view` plus backend download authorization | Downloads the current version as a stream. No specific-version download route is registered. |
| `POST /api/v1/ddm/documents/{ddmDocument}/archive`, `/unarchive` | `ddm.documents.archive` | Archive / restore from archive. No reason is accepted by the current controller. |
| `DELETE /api/v1/ddm/documents/{ddmDocument}` | `ddm.documents.delete` | Soft-delete; body requires `reason`; returns `204`. |
| `POST /api/v1/ddm/documents/{ddmDeletedDocument}/restore` | `ddm.documents.delete` | Undelete; body requires `reason`. This route is for soft-deleted documents, not unarchiving. |
| `GET /api/v1/ddm/download-requests` | Any of `ddm.documents.view`, `ddm.downloads.request`, `ddm.downloads.approve-restricted`, `ddm.downloads.approve-confidential` | Filters: `status`, `document_id`, `requester`, `per_page`. Server applies visibility scope. |
| `GET /api/v1/ddm/download-requests/{ddmDownloadRequest}` | Same as list | Request detail; server applies visibility scope. |
| `POST /api/v1/ddm/documents/{ddmDocument}/download-requests` | Both `ddm.documents.view` and `ddm.downloads.request` | Body: `reason`; see `StoreDocumentDownloadRequestRequest`. |
| `POST /api/v1/ddm/download-requests/{ddmDownloadRequest}/approve`, `/deny` | `ddm.documents.view` and at least one of the two approve permissions | Approve body uses `approval_days` and `decision_note`; deny uses `decision_note`. The service enforces access-level approval rules and prevents self-approval. |

No DDM reports, request-cancel, document-activity, or specific-version download route is registered. Download request lifecycle values and timeout behavior must follow the actual request Resource and backend service, not assumptions in the earlier draft.

### 4.3 PMMS

| Method and path | Backend gate | Request / behavior |
| --- | --- | --- |
| `GET /api/v1/pmms/categories`, `/categories/{pmmsCategory}` | Either `pmms.projects.view-all` or `pmms.projects.view-own` | Filters: `q`, `is_active`, `per_page`. These are project categories, not PMMS document categories. |
| `POST /api/v1/pmms/categories` | `pmms.categories.manage` | Create project category. |
| `PUT`, `PATCH /api/v1/pmms/categories/{pmmsCategory}` | `pmms.categories.manage` | Update project category. |
| `GET /api/v1/pmms/projects` | Either `pmms.projects.view-all` or `pmms.projects.view-own` | Filters: `q`, `implementation_year`, `project_category_id`, `status`, `indicator`, `assigned_pe_id`, `contractor`, `fund_source`, `region`, `lgu`, `sort`, `direction`, `per_page`. PE ownership is enforced server-side. |
| `POST /api/v1/pmms/projects` | `pmms.projects.create` | Create project; fields are validated by `StoreProjectRequest`. Returns `201` and Project Resource. |
| `GET /api/v1/pmms/projects/{pmmsProject}` | Either project-view permission | Project Resource; out-of-scope PE access returns `404`. |
| `PUT`, `PATCH /api/v1/pmms/projects/{pmmsProject}` | `pmms.projects.manage-own` plus owner check | Update own project; planned dates can change only while `not_started`. |
| `GET /api/v1/pmms/projects/{pmmsProject}/history`, `/updates` | Either project-view permission plus owner/scope check | Paginated ProjectHistory / ProjectUpdate Resources. |
| `POST /api/v1/pmms/projects/{pmmsProject}/start`, `/progress`, `/pause`, `/resume` | `pmms.projects.manage-own` plus owner/state checks | Start accepts optional `remarks`; progress accepts `report_date`, `progress_percentage`, optional `accomplishment` and `remarks`; pause accepts `status` and `reason`; resume accepts `revised_finish_date` and `remarks`. Progress from `not_started` also changes status to ongoing; 100% completes the project. |
| `POST /api/v1/pmms/projects/{pmmsProject}/terminate`, `/reopen`, `/reassign` | `pmms.projects.administer` | Terminate: `reason`; reopen: `reason`, `progress_percentage` (0–99); reassign: `assigned_pe_id`, `reason`. |
| `DELETE /api/v1/pmms/projects/{pmmsProject}` | `pmms.projects.administer` | Soft-delete; body requires `reason`; returns `204`. |
| `POST /api/v1/pmms/projects/{pmmsDeletedProject}/restore` | `pmms.projects.administer` | Restore; body requires `reason`. |
| `GET /api/v1/pmms/dashboard` | `pmms.dashboard.view` and either project-view permission | Raw JSON dashboard object. Filters are the project filters; response contains `filters`, `generated_at`, `counts`, `totals`, `average_progress`, `by_category`, `by_year`, and `watchlist`. |
| `GET /api/v1/pmms/reports/projects` | `pmms.reports.view` and either project-view permission | Raw JSON report summary with `filters`, `group_by`, `totals`, `groups`, `generated_at`. Filters include `group_by` (`status`, `indicator`, `category`, `implementation_year`, `assigned_pe`, `fund_source`, `region`, `lgu`, `contractor`). |
| `GET /api/v1/pmms/reports/projects/export` | `pmms.reports.view` and either project-view permission | CSV stream; filters use project filter fields. |

Project create currently validates `contract_number` as unique, which conflicts with the approved backend rule that it is not unique. This must be reconciled with the backend owner; do not silently make the frontend reject duplicates or assume duplicate submissions will succeed.

### 4.4 Required by the feature plan but not currently registered

These routes are referenced by product specifications or earlier drafts, but are absent from the current `routes/api.php`. The dependent UI must remain blocked or use explicitly approved mocks until the backend route and request/response contract exist.

| Planned capability | Earlier assumed route | Current status / dependency |
| --- | --- | --- |
| Change password | `POST /auth/change-password` | Not registered. |
| DDM report data and CSV export | `/ddm/reports/...` | Not registered. |
| Cancel own pending download request | `POST /ddm/download-requests/{id}/cancel` | Not registered. |
| DDM document activity feed | No confirmed path | Not registered. |
| Download a selected historical document version | `/ddm/documents/{id}/versions/{n}/download` | Not registered. Versions are returned in document detail, but only current-version download is routed. |
| List active Project Engineers for reassignment | `/pmms/engineers` | Not registered; do not use `/users` unless the caller has `users.manage` and product requirements permit it. |
| Correct project planned dates after start | Earlier draft placed under `/projects/{id}/administer/correct-dates` | Not registered. |
| PMMS supporting-document list, upload, download, categories | Earlier draft used `/pmms/projects/{id}/documents...` | No project-document routes are registered. |

### 4.5 Contract mismatches to resolve before dependent features

| Mismatch | Backend implementation now | Product/design requirement | Action |
| --- | --- | --- | --- |
| Project field names | `project_name`, `project_category_id` | Earlier frontend types used `name`, `category`/`category_id` | Frontend must use current resource/request names. |
| Project contract number | `StoreProjectRequest` requires uniqueness | Approved backend decision says it is nullable and not unique | Backend decision/validation needs reconciliation. |
| Download approval duration | Request field `approval_days` | Earlier draft used `expires_in_days` | Use `approval_days` unless backend changes. |
| Download request status | Resource returns `status`, `effective_status`, `is_lapsed`, `is_expired` | Earlier type had a single status and no lapse fields | Render server-returned effective state; do not calculate expiry locally. |
| Reopen project | Request uses `progress_percentage` and `reason` | Earlier feature draft specified a target status | Follow actual request or revise backend contract. |
| Permissions | Backend includes `ddm.downloads.*`, `pmms.projects.manage-own`, `pmms.categories.manage` | Earlier docs used some different permission names | Use the permission strings returned by `/auth/me` and listed above. |

## 5. Download handling in the client

1. Call the download endpoint with `responseType: 'blob'` and the Bearer token.
2. On success, read the filename from `Content-Disposition` and save the blob.
3. On `403 download_approval_required`, open the request-download dialog. The request-create route requires both `ddm.documents.view` and `ddm.downloads.request`.
4. On `404` with `file_missing`, show the file-missing message.
5. A blob error response must be read as text and parsed as the standard error body before use. Only the current-version DDM download route is registered today; do not create a version-download URL in the client.

The server writes the audit row before streaming. A failed audit write means no file is sent.

## 6. Contract change process

When the frontend needs a route or field the backend does not currently register or return, do not invent it. Add it under the backend route gaps in `development-workflow.md`, mark the dependent slice blocked, and ask the user/backend owner for the needed contract. Update this file only after the backend route and request/response behavior are verified.