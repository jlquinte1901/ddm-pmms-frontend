import type { CategoryListParams } from './types'

export function toCategoryListParams(
  filters: Record<string, string>,
  page: number,
  perPage: number,
): CategoryListParams {
  const params: CategoryListParams = { page, per_page: perPage }

  const q = filters.q?.trim()
  if (q) {
    params.q = q
  }

  if (filters.is_active === '1') {
    params.is_active = 1
  } else if (filters.is_active === '0') {
    params.is_active = 0
  }

  return params
}
