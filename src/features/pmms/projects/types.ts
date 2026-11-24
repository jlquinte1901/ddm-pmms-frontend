import type {
  Indicator,
  ProjectStatus,
  UserSummary,
} from '@/shared/types/api'

/**
 * Mirrors the sort allow-list in App\Http\Requests\IndexProjectRequest.
 */
export const PROJECT_SORTS = [
  'project_name',
  'implementation_year',
  'contract_amount',
  'progress_percentage',
  'status',
  'planned_start_date',
  'planned_finish_date',
  'effective_finish_date',
  'created_at',
] as const

export type ProjectSort = (typeof PROJECT_SORTS)[number]

export type SortDirection = 'asc' | 'desc'

export const PROJECT_STATUSES: readonly ProjectStatus[] = [
  'not_started',
  'ongoing',
  'suspended',
  'postponed',
  'completed',
  'terminated',
]

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  not_started: 'Not Started',
  ongoing: 'Ongoing',
  suspended: 'Suspended',
  postponed: 'Postponed',
  completed: 'Completed',
  terminated: 'Terminated',
}

/**
 * Query parameters accepted by GET /api/v1/pmms/projects. Undefined values
 * are never sent.
 */
export type ProjectListParams = {
  q?: string
  implementation_year?: number
  project_category_id?: number
  status?: ProjectStatus
  indicator?: Indicator
  sort?: ProjectSort
  direction?: SortDirection
  page?: number
  per_page?: number
}

/**
 * Body accepted by POST /api/v1/pmms/projects. Ownership, status, and
 * progress are never sent; the backend derives them from the actor.
 */
export type ProjectPayload = {
  project_category_id: number
  implementation_year: number
  project_name: string
  contract_number: string | null
  location: string
  region: string | null
  lgu: string | null
  department: string | null
  implementing_office: string | null
  project_manager: string | null
  fund_source: string
  contract_amount: string
  revised_amount: string | null
  planned_start_date: string
  planned_finish_date: string
  contractor: string | null
  remarks: string | null
}

/**
 * Mirrors App\Http\Resources\ProjectHistoryResource. One row is one changed
 * field; rows with the same change_set_id belong to one event.
 */
export type ProjectHistoryEntry = {
  id: number
  change_set_id: string | null
  action: string
  field_name: string | null
  previous_value: unknown
  new_value: unknown
  reason: string | null
  actor?: UserSummary | null
  created_at: string | null
}

/**
 * Mirrors App\Http\Resources\ProjectUpdateResource.
 */
export type ProjectUpdateEntry = {
  id: number
  report_date: string | null
  previous_progress: number
  progress_percentage: number
  accomplishment: string | null
  remarks: string | null
  reporter?: UserSummary | null
  created_at: string | null
}
