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

export type DocumentState = 'active' | 'archived' | 'deleted'

/**
 * Mirrors App\Http\Resources\DocumentCategoryResource. The /ddm/categories
 * endpoint only returns DDM-scoped categories.
 */
export type DocumentCategory = {
  id: number
  name: string
  scope: 'ddm' | 'pmms'
  default_access_level: AccessLevel
  is_active: boolean
  documents_count?: number
  created_at: string | null
  updated_at: string | null
}

/**
 * Mirrors App\Http\Resources\DocumentVersionResource.
 */
export type DocumentVersion = {
  id: number
  document_id: number
  version_number: number
  original_name: string
  mime_type: string
  file_size: number
  checksum_sha256: string
  change_note: string | null
  uploaded_by: number
  uploader?: UserSummary | null
  created_at: string | null
}

/**
 * Mirrors App\Http\Resources\DocumentResource.
 */
export type Document = {
  id: number
  category?: DocumentCategory | null
  title: string
  reference_no: string | null
  document_date: string | null
  description: string | null
  remarks: string | null
  access_level: AccessLevel | null
  effective_access_level: AccessLevel
  state: DocumentState
  is_archived: boolean
  archived_at: string | null
  archived_by: number | null
  created_by: number
  creator?: UserSummary | null
  latest_version_number: number
  latest_version?: DocumentVersion | null
  versions?: DocumentVersion[]
  can_download: boolean
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
}

/**
 * Mirrors App\Http\Resources\DocumentSummaryResource.
 */
export type DocumentSummary = {
  id: number
  title: string
  reference_no: string | null
  effective_access_level: AccessLevel
  state: DocumentState
  category?: DocumentCategory | null
}

/**
 * Mirrors App\Http\Resources\DocumentDownloadRequestResource.
 */
export type DocumentDownloadRequest = {
  id: number
  document_id: number
  document?: DocumentSummary | null
  requested_by: number
  requester?: UserSummary | null
  decided_by: number | null
  decider?: UserSummary | null
  status: RequestStatus
  effective_status: EffectiveRequestStatus
  is_lapsed: boolean
  is_expired: boolean
  reason: string
  decision_note: string | null
  decided_at: string | null
  expires_at: string | null
  created_at: string | null
  updated_at: string | null
}
