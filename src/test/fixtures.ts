import type {
  AuthUser,
  Paginated,
  Permission,
  Project,
  ProjectCategory,
  Role,
} from '@/shared/types/api'
import type { DashboardResponse } from '@/features/pmms/dashboard/types'

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
