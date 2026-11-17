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
