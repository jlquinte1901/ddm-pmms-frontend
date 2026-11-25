import { INDICATOR_META } from '../shared/indicatorMeta'
import {
  PROJECT_SORTS,
  PROJECT_STATUSES,
  type ProjectListParams,
  type ProjectSort,
  type SortDirection,
} from './types'

const SORT_SET = new Set<string>(PROJECT_SORTS)
const STATUS_SET = new Set<string>(PROJECT_STATUSES)
const INDICATOR_SET = new Set<string>(
  INDICATOR_META.map((meta) => meta.value),
)

export function isProjectSort(
  value: string | undefined,
): value is ProjectSort {
  return value !== undefined && SORT_SET.has(value)
}

export function isSortDirection(
  value: string | undefined,
): value is SortDirection {
  return value === 'asc' || value === 'desc'
}

function positiveInteger(value: string | undefined): number | undefined {
  const parsed = Number.parseInt(value ?? '', 10)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

/**
 * Converts the raw URL filters into the validated shape the API accepts.
 * Anything unrecognized is dropped rather than sent to the server.
 */
export function toProjectListParams(
  filters: Record<string, string>,
  page: number,
  perPage: number,
): ProjectListParams {
  const params: ProjectListParams = { page, per_page: perPage }

  const q = filters.q?.trim()
  if (q) {
    params.q = q
  }

  const year = positiveInteger(filters.implementation_year)
  if (year !== undefined) {
    params.implementation_year = year
  }

  const categoryId = positiveInteger(filters.project_category_id)
  if (categoryId !== undefined) {
    params.project_category_id = categoryId
  }

  const status = filters.status
  if (status !== undefined && STATUS_SET.has(status)) {
    params.status = status as ProjectListParams['status']
  }

  const indicator = filters.indicator
  if (indicator !== undefined && INDICATOR_SET.has(indicator)) {
    params.indicator = indicator as ProjectListParams['indicator']
  }

  const assignedPeId = positiveInteger(filters.assigned_pe_id)
  if (assignedPeId !== undefined) {
    params.assigned_pe_id = assignedPeId
  }

  if (isProjectSort(filters.sort)) {
    params.sort = filters.sort
  }

  if (isSortDirection(filters.direction)) {
    params.direction = filters.direction
  }

  return params
}
