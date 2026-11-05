# API Contracts — DDM-PMMS (Frontend View)

**Status:** the frontend's working copy of the contract. The backend design (`ddm-pmms-backend.md`) is the authority. If the real API differs, the backend wins and this file must be corrected in the same change. Items marked **(Gap)** are not yet defined in the backend design and need a decision before the screen that depends on them is built.

**Read with:** `architecture.md`, `frontend-guidelines.md`, `feature-specifications.md`.

## 1. Conventions

- Base path: `/api/v1`. Auth: `Authorization: Bearer <token>`. JSON requests, except uploads (`multipart/form-data`).
- IDs are unsigned integers. Money is a decimal string (`"1250000.00"`). Dates are `YYYY-MM-DD`. Timestamps are ISO 8601 in `Asia/Manila`.
- Paginated collections: `?page=1&per_page=25` (maximum 100). Response: `{ data: [...], meta: { current_page, per_page, total, last_page }, links }`. Single resources: `{ data: {...} }`.
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
export type RequestStatus = 'pending' | 'approved' | 'denied' | 'expired' | 'cancelled';

export type ApiErrorBody = {
  message: string;
  code: string;
  errors: Record<string, string[]>;
};

export type Paginated<T> = {
  data: T[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;          // role name from the server
  permissions: string[]; // effective permissions, module.resource.action
};

export type Project = {
  id: number;
  category: { id: number; name: string } | null;
  implementation_year: number;
  name: string;
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
  assigned_pe: { id: number; name: string };
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
};

export type ProjectUpdate = {
  id: number;
  project_id: number;
  report_date: string;
  progress_percentage: number;
  previous_progress_percentage: number;
  remarks: string | null;
  reported_by: { id: number; name: string };
  created_at: string;
};

export type ProjectHistoryEntry = {
  id: number;
  change_set_id: string | null;
  action: string;
  field: string | null;
  old_value: unknown;
  new_value: unknown;
  reason: string | null;
  actor: { id: number; name: string };
  created_at: string;
};

export type DocumentCategory = {
  id: number;
  name: string;
  scope: 'ddm' | 'pmms';
  default_access_level: AccessLevel;
  is_active: boolean;
};

export type DocumentVersion = {
  id: number;
  version_number: number;
  original_name: string;
  size_bytes: number;
  mime_type: string;
  checksum_sha256: string;
  change_note: string | null;
  uploaded_by: { id: number; name: string };
  created_at: string;
  is_current: boolean;
};

export type DdmDocument = {
  id: number;
  title: string;
  reference_number: string | null;
  description: string | null;
  category: { id: number; name: string };
  access_level: AccessLevel;       // effective level
  latest_version_number: number;
  is_archived: boolean;
  deleted_at: string | null;       // present only for Super Admin views
  can_download: boolean;           // server-computed for the current user
  download_request: { id: number; status: RequestStatus; expires_at: string | null } | null;
  created_at: string;
  updated_at: string;
};

export type DownloadRequest = {
  id: number;
  document: { id: number; title: string; access_level: AccessLevel };
  requested_by: { id: number; name: string };
  reason: string;
  status: RequestStatus;
  decided_by: { id: number; name: string } | null;
  decision_note: string | null;
  decided_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export type AuditLogEntry = {
  id: number;
  actor: { id: number; name: string } | null;
  action: string;
  subject_type: string | null;
  subject_id: number | null;
  ip_address: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};
```

Field names above follow the backend design as closely as it is known. Confirm each against the real API Resources when the endpoint is wired, and fix this file if they differ. If the backend exposes an OpenAPI document, generate types from it instead **(Proposed, needs approval)**.

## 4. Endpoints

Permission names are what the frontend uses to decide visibility. The server still enforces everything.

### 4.1 Shared Core

| Method and path | Purpose | Notes |
| --- | --- | --- |
| `POST /auth/login` | Sign in | Body: `email`, `password`. Returns token, expiry, user. Throttled. Errors are generic. |
| `GET /auth/me` | Current user, role, effective permissions | Called on every app load. |
| `POST /auth/logout` | Revoke current token | |
| `POST /auth/change-password` | Change own password | Revokes other tokens. Minimum 12 characters. |
| `GET /users` | List users | `users.manage`. Paginated, filters: `q`, `role`, `is_active`. |
| `POST /users` | Create user | `users.manage`. Body includes `role_id`. |
| `GET /users/{id}` | User detail | |
| `PATCH /users/{id}` | Update user, role, active state | Role change and deactivation revoke tokens. |
| `PUT /users/{id}/permissions` | Grant module access to a Viewer | `users.manage`. Super Admin only in practice. |
| `GET /roles`, `GET /permissions` | Role and permission lists | `roles.manage`. |
| `GET /audit-logs` | Audit trail | `audit.view`. Filters: `actor_id`, `action`, `from`, `to`. Read-only. |

**(Gap 1) PE list for Admin.** The reassign dialog and the "assigned PE" filter need a list of active users with the PE role. `GET /users` is limited to `users.manage`, which Admin may not hold. Proposal: `GET /pmms/engineers` (active PEs, `id` and `name` only), available to anyone with `pmms.projects.view-all` or `pmms.projects.administer`.

### 4.2 DDM

| Method and path | Purpose | Permission |
| --- | --- | --- |
| `GET /ddm/categories` | List categories | `ddm.documents.view` |
| `POST /ddm/categories`, `PATCH /ddm/categories/{id}` | Manage categories | `ddm.categories.manage` |
| `GET /ddm/documents` | List and search | `ddm.documents.view`. Filters: `q`, `category_id`, `access_level`, `archived`, `from`, `to`, `sort`. Never returns project documents. |
| `POST /ddm/documents` | Register and upload first version | `ddm.documents.upload`. Multipart: metadata fields plus `file`. |
| `GET /ddm/documents/{id}` | Document detail | `ddm.documents.view` |
| `PATCH /ddm/documents/{id}` | Edit metadata | Admin and Super Admin. |
| `GET /ddm/documents/{id}/versions` | Version history | |
| `POST /ddm/documents/{id}/versions` | Upload a new version | Multipart: `file`, `change_note`. `409` if archived. |
| `GET /ddm/documents/{id}/download` | Download current version | Returns the file stream, or `403 download_approval_required`. |
| `GET /ddm/documents/{id}/versions/{n}/download` | Download a specific version | Same rules. |
| `POST /ddm/documents/{id}/archive`, `POST /ddm/documents/{id}/restore` | Archive and restore | `ddm.documents.archive` |
| `DELETE /ddm/documents/{id}` | Soft delete | `ddm.documents.delete` (Super Admin). Body: `reason`. |
| `POST /ddm/documents/{id}/undelete` | Undelete | Super Admin. Body: `reason`. |
| `POST /ddm/documents/{id}/download-requests` | Request download | Body: `reason` (10 to 1000). |
| `GET /ddm/download-requests` | My requests, or the approval queue | Filters: `status`, `mine`. Approvers see what they may decide. |
| `POST /ddm/download-requests/{id}/approve` | Approve | Body: optional `decision_note`, `expires_in_days` (default 7, maximum 30). Nobody approves his own. Restricted: any Admin. Confidential: Super Admin only. |
| `POST /ddm/download-requests/{id}/deny` | Deny | Body: `decision_note`. |
| `POST /ddm/download-requests/{id}/cancel` | Cancel own pending request | |
| `GET /ddm/reports/summary`, `GET /ddm/reports/documents` | Report data | `ddm.reports.view` |
| `GET /ddm/reports/documents/export` | CSV export | Streamed, audit-logged. |

Pending requests lapse after 14 days. Approved requests expire (7 days by default).

### 4.3 PMMS

| Method and path | Purpose | Permission |
| --- | --- | --- |
| `GET /pmms/project-categories` | List project categories | any PMMS user |
| `GET /pmms/projects` | List projects | `view-all` or `view-own` |
| `POST /pmms/projects` | Register project | `pmms.projects.create` (PE) |
| `GET /pmms/projects/{id}` | Project detail | view-all or owner, else `404` |
| `PATCH /pmms/projects/{id}` | Edit own project | owner PE. Planned dates only while `not_started`. |
| `POST /pmms/projects/{id}/progress` | Submit progress report | owner PE. Body: `report_date`, `progress_percentage`, `remarks`. 100 completes the project. |
| `GET /pmms/projects/{id}/updates` | Progress reports | |
| `POST /pmms/projects/{id}/pause` | Suspend or postpone | owner PE. Body: `status` (`suspended` or `postponed`), `reason`. |
| `POST /pmms/projects/{id}/resume` | Resume | owner PE. Body: `revised_finish_date`, `remark`. |
| `GET /pmms/projects/{id}/history` | Project history | view-all or owner |
| `GET /pmms/projects/{id}/documents` | Project documents | view-all or owner |
| `POST /pmms/projects/{id}/documents` | Upload supporting document | owner PE |
| `GET /pmms/projects/{id}/documents/{docId}/download` | Download | Same download rules. Owning PE downloads directly (logged). |
| `POST /pmms/projects/{id}/administer/terminate` | Terminate | `pmms.projects.administer`. Body: `reason`. |
| `POST /pmms/projects/{id}/administer/reopen` | Reopen completed or terminated | Body: `reason`, target status. |
| `POST /pmms/projects/{id}/administer/reassign` | Reassign PE | Body: `assigned_pe_id`, `reason`. |
| `POST /pmms/projects/{id}/administer/delete`, `.../restore` | Soft delete and restore | Body: `reason`. |
| `POST /pmms/projects/{id}/administer/correct-dates` | Correct planned dates after start | Body: dates, `reason`. |
| `GET /pmms/dashboard` | Dashboard numbers and watchlist | `pmms.dashboard.view` |
| `GET /pmms/reports/projects` | Report rows or grouped totals | `pmms.reports.view`. Same filter object as the list. |
| `GET /pmms/reports/projects/export` | CSV export | Streamed, audit-logged. |

**Project list filters** (the single shared filter object used by list, dashboard, and reports): `q`, `implementation_year`, `category_id`, `status`, `indicator`, `fund_source`, `region`, `lgu`, `contractor`, `assigned_pe_id` (only for users who can view all projects), `sort`, `group_by`.

**(Gap 2) Path details for administer actions.** The backend design defines the five actions but the exact paths above are the frontend's assumption. Confirm them.

**(Gap 3) Pmms document categories.** Project documents need a category list scoped to `pmms`. Proposal: `GET /pmms/document-categories`.

**(Gap 4) Filter options.** Fund source, region, LGU, and contractor are free text. Proposal: `GET /pmms/filter-options` returning distinct values for these fields so filters can use selects. Until then, use text inputs.

## 5. Download handling in the client

1. Call the download endpoint with `responseType: 'blob'` and the Bearer token.
2. On success, read the filename from `Content-Disposition` and save the blob.
3. On `403 download_approval_required`, open the request-download dialog.
4. On `404` with `file_missing`, show the file-missing message.
5. A blob error response must be read as text and parsed as the standard error body before use.

The server writes the audit row before streaming. A failed audit write means no file is sent.

## 6. Contract change process

When the frontend needs something the contract does not cover, do not invent an endpoint or a field. Write the need under "Open contract questions" in `development-workflow.md` and ask the user and the backend owner. A frontend change is not complete until this file matches the real API.