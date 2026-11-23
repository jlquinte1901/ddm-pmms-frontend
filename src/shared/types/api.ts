export type RoleName =
  | 'super_admin'
  | 'admin'
  | 'project_engineer'
  | 'viewer'

export type ProjectStatus =
  | 'not_started'
  | 'ongoing'
  | 'suspended'
  | 'postponed'
  | 'completed'
  | 'terminated'

export type Indicator =
  | 'normal'
  | 'critical'
  | 'overdue'
  | 'paused'
  | 'completed'
  | 'terminated'

export type AccessLevel = 'restricted' | 'confidential'

export type RequestStatus = 'pending' | 'approved' | 'denied' | 'cancelled'

export type EffectiveRequestStatus =
  | RequestStatus
  | 'lapsed'
  | 'expired'

export type Permission = {
  id: number
  name: string
  module: string
  is_system: boolean
  created_at: string | null
  updated_at: string | null
}

export type Role = {
  id: number
  name: RoleName | string
  label: string
  is_system: boolean
  permissions?: Permission[]
  permissions_count?: number
  created_at: string | null
  updated_at: string | null
}

export type AuthUser = {
  id: number
  full_name: string
  email: string
  section: string | null
  is_active: boolean
  last_login_at: string | null
  role: Role | null
  permissions: Permission[]
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
}

export type LoginResponse = {
  token: string
  token_type: string
  expires_at: string | null
  user: AuthUser
}

export type ApiErrorBody = {
  message: string
  code: string
  errors: Record<string, string[]>
}

export type PaginationLink = {
  url: string | null
  label: string
  active: boolean
}

export type Paginated<T> = {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    links: PaginationLink[]
    path: string
    per_page: number
    to: number | null
    total: number
  }
}

export type UserSummary = {
  id: number
  full_name: string
}

export type ProjectCategory = {
  id: number
  name: string
  is_active: boolean
  projects_count?: number
  created_at: string | null
  updated_at: string | null
}

/**
 * Mirrors App\Http\Resources\ProjectResource. Optional relation fields are
 * only present when the endpoint eager-loads them.
 */
export type Project = {
  id: number
  project_category_id: number
  category?: ProjectCategory | null
  assigned_pe_id: number
  assigned_pe?: UserSummary | null
  created_by: number
  creator?: UserSummary | null
  implementation_year: number
  project_name: string
  contract_number: string | null
  location: string | null
  region: string | null
  lgu: string | null
  department: string | null
  implementing_office: string | null
  project_manager: string | null
  fund_source: string | null
  contract_amount: string
  revised_amount: string | null
  planned_start_date: string | null
  planned_finish_date: string | null
  revised_finish_date: string | null
  effective_finish_date: string | null
  actual_start_date: string | null
  actual_finish_date: string | null
  contractor: string | null
  status: ProjectStatus
  status_label: string
  progress_percentage: number
  paused_since: string | null
  completed_at: string | null
  remarks: string | null
  indicator: Indicator
  indicator_label: string
  days_remaining: number | null
  days_paused: number | null
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
}
