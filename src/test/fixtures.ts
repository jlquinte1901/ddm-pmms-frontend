import type {
  AuthUser,
  Document,
  DocumentCategory,
  DocumentDownloadRequest,
  DocumentVersion,
  Paginated,
  Permission,
  Project,
  ProjectCategory,
  Role,
} from '@/shared/types/api'
import type { DashboardResponse } from '@/features/pmms/dashboard/types'
import type {
  ProjectHistoryEntry,
  ProjectUpdateEntry,
} from '@/features/pmms/projects/types'

let permissionId = 1

export function makePermission(name: string): Permission {
  const module = name.split('.')[0] ?? 'shared'
  const permission: Permission = {
    id: permissionId,
    name,
    module,
    is_system: true,
    created_at: null,
    updated_at: null,
  }

  permissionId += 1

  return permission
}

export function makeRole(
  name = 'viewer',
  label = 'Viewer',
): Role {
  return {
    id: 1,
    name,
    label,
    is_system: true,
    created_at: null,
    updated_at: null,
  }
}

export function makeUser({
  permissions = [],
  role = makeRole(),
  overrides = {},
}: {
  permissions?: string[]
  role?: Role
  overrides?: Partial<AuthUser>
} = {}): AuthUser {
  return {
    id: 1,
    full_name: 'Test User',
    email: 'test.user@example.com',
    section: 'Data Management Section',
    is_active: true,
    last_login_at: null,
    role,
    permissions: permissions.map(makePermission),
    created_at: '2026-01-01T00:00:00+08:00',
    updated_at: '2026-01-01T00:00:00+08:00',
    deleted_at: null,
    ...overrides,
  }
}

export function makePaginated<T>(
  items: T[],
  meta: Partial<Paginated<T>['meta']> = {},
): Paginated<T> {
  const total = items.length
  const lastPage = meta.last_page ?? 1

  return {
    data: items,
    links: { first: null, last: null, prev: null, next: null },
    meta: {
      current_page: 1,
      from: total > 0 ? 1 : null,
      last_page: lastPage,
      links: [],
      path: '',
      per_page: 15,
      to: total > 0 ? total : null,
      total,
      ...meta,
    },
  }
}

export function makeProjectCategory(
  overrides: Partial<ProjectCategory> = {},
): ProjectCategory {
  return {
    id: 1,
    name: 'Roads',
    is_active: true,
    created_at: '2026-01-01T00:00:00+08:00',
    updated_at: '2026-01-01T00:00:00+08:00',
    ...overrides,
  }
}

export function makeDocumentCategory(
  overrides: Partial<DocumentCategory> = {},
): DocumentCategory {
  return {
    id: 1,
    name: 'Budget Records',
    scope: 'ddm',
    default_access_level: 'restricted',
    is_active: true,
    documents_count: 1,
    created_at: '2026-01-01T00:00:00+08:00',
    updated_at: '2026-01-01T00:00:00+08:00',
    ...overrides,
  }
}

export function makeDocumentVersion(
  overrides: Partial<DocumentVersion> = {},
): DocumentVersion {
  return {
    id: 1,
    document_id: 1,
    version_number: 1,
    original_name: 'annual-budget.pdf',
    mime_type: 'application/pdf',
    file_size: 2048,
    checksum_sha256: 'a'.repeat(64),
    change_note: null,
    uploaded_by: 2,
    uploader: { id: 2, full_name: 'Data Management' },
    created_at: '2026-11-01T09:00:00+08:00',
    ...overrides,
  }
}

export function makeDocument(overrides: Partial<Document> = {}): Document {
  return {
    id: 1,
    category: makeDocumentCategory(),
    title: 'Annual Budget Report',
    reference_no: 'BUD-2026-001',
    document_date: '2026-01-15',
    description: 'Annual budget records.',
    remarks: null,
    access_level: null,
    effective_access_level: 'restricted',
    state: 'active',
    is_archived: false,
    archived_at: null,
    archived_by: null,
    created_by: 2,
    creator: { id: 2, full_name: 'Data Management' },
    latest_version_number: 1,
    latest_version: makeDocumentVersion(),
    versions: [makeDocumentVersion()],
    can_download: false,
    created_at: '2026-11-01T09:00:00+08:00',
    updated_at: '2026-11-01T09:00:00+08:00',
    deleted_at: null,
    ...overrides,
  }
}

export function makeDownloadRequest(
  overrides: Partial<DocumentDownloadRequest> = {},
): DocumentDownloadRequest {
  return {
    id: 1,
    document_id: 7,
    document: {
      id: 7,
      title: 'Annual Budget Report',
      reference_no: 'BUD-2026-001',
      effective_access_level: 'restricted',
      state: 'active',
      category: makeDocumentCategory(),
    },
    requested_by: 5,
    requester: { id: 5, full_name: 'Viewer User' },
    decided_by: null,
    decider: null,
    status: 'pending',
    effective_status: 'pending',
    is_lapsed: false,
    is_expired: false,
    reason: 'Required for the annual review.',
    decision_note: null,
    decided_at: null,
    expires_at: null,
    created_at: '2026-11-26T09:00:00+08:00',
    updated_at: '2026-11-26T09:00:00+08:00',
    ...overrides,
  }
}

export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    project_category_id: 1,
    assigned_pe_id: 2,
    created_by: 2,
    implementation_year: 2026,
    project_name: 'Sample Road Concreting',
    contract_number: 'CED-2026-001',
    location: 'Barangay San Isidro',
    region: 'Region IV-A',
    lgu: 'City of Calamba',
    department: 'City Engineering Department',
    implementing_office: 'City Engineering Department',
    project_manager: 'Engr. Sample Manager',
    fund_source: 'Local Fund',
    contract_amount: '1500000.00',
    revised_amount: null,
    planned_start_date: '2026-01-05',
    planned_finish_date: '2026-06-30',
    revised_finish_date: null,
    effective_finish_date: '2026-06-30',
    actual_start_date: null,
    actual_finish_date: null,
    contractor: 'Sample Construction Co.',
    status: 'ongoing',
    status_label: 'Ongoing',
    progress_percentage: 60,
    paused_since: null,
    completed_at: null,
    remarks: null,
    indicator: 'normal',
    indicator_label: 'Normal',
    days_remaining: 120,
    days_paused: null,
    created_at: '2026-01-01T00:00:00+08:00',
    updated_at: '2026-01-01T00:00:00+08:00',
    deleted_at: null,
    ...overrides,
  }
}

export function makeProjectHistoryEntry(
  overrides: Partial<ProjectHistoryEntry> = {},
): ProjectHistoryEntry {
  return {
    id: 1,
    change_set_id: 'change-set-1',
    action: 'updated',
    field_name: 'project_name',
    previous_value: 'Old project name',
    new_value: 'New project name',
    reason: null,
    actor: { id: 2, full_name: 'Demo Project Engineer' },
    created_at: '2026-11-24T09:00:00+08:00',
    ...overrides,
  }
}

export function makeProjectUpdateEntry(
  overrides: Partial<ProjectUpdateEntry> = {},
): ProjectUpdateEntry {
  return {
    id: 1,
    report_date: '2026-11-24',
    previous_progress: 40,
    progress_percentage: 60,
    accomplishment: 'Completed the base course.',
    remarks: null,
    reporter: { id: 2, full_name: 'Demo Project Engineer' },
    created_at: '2026-11-24T09:30:00+08:00',
    ...overrides,
  }
}

export function makeDashboardResponse(
  overrides: Partial<DashboardResponse> = {},
): DashboardResponse {
  return {
    filters: {
      implementation_year: null,
      project_category_id: null,
      status: null,
      indicator: null,
      assigned_pe_id: null,
      contractor: null,
      fund_source: null,
      region: null,
      lgu: null,
      q: null,
    },
    generated_at: '2026-11-23T14:22:47+08:00',
    counts: {
      total: 0,
      by_indicator: {
        normal: 0,
        critical: 0,
        overdue: 0,
        paused: 0,
        completed: 0,
        terminated: 0,
      },
      by_status: {
        not_started: 0,
        ongoing: 0,
        suspended: 0,
        postponed: 0,
        completed: 0,
        terminated: 0,
      },
    },
    totals: {
      contract_amount: '0.00',
      revised_amount: '0.00',
    },
    average_progress: 0,
    by_category: [],
    by_year: [],
    watchlist: [],
    ...overrides,
  }
}
