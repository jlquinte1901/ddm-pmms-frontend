import type {
  Indicator,
  Project,
  ProjectStatus,
} from '@/shared/types/api'

export type DashboardCounts = {
  total: number
  by_indicator: Record<Indicator, number>
  by_status: Record<ProjectStatus, number>
}

export type DashboardTotals = {
  contract_amount: string
  revised_amount: string
}

export type DashboardCategoryCount = {
  category_id: number
  category: string
  count: number
}

export type DashboardYearCount = {
  implementation_year: number
  count: number
}

/**
 * Mirrors ProjectFilter::toArray(). A null value means "no filter".
 */
export type DashboardFilters = {
  implementation_year: number | null
  project_category_id: number | null
  status: ProjectStatus | null
  indicator: Indicator | null
  assigned_pe_id: number | null
  contractor: string | null
  fund_source: string | null
  region: string | null
  lgu: string | null
  q: string | null
}

/**
 * Mirrors the raw JSON returned by GET /api/v1/pmms/dashboard.
 */
export type DashboardResponse = {
  filters: DashboardFilters
  generated_at: string
  counts: DashboardCounts
  totals: DashboardTotals
  average_progress: number
  by_category: DashboardCategoryCount[]
  by_year: DashboardYearCount[]
  watchlist: Project[]
}
