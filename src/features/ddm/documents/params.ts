import type { AccessLevel, DocumentState } from '@/shared/types/api'
import type { DocumentListParams } from './types'

const ACCESS_LEVELS = new Set<string>(['restricted', 'confidential'])
const STATES = new Set<string>(['active', 'archived', 'deleted', 'all'])

function positiveInteger(value: string | undefined): number | undefined {
  const parsed = Number.parseInt(value ?? '', 10)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

export function toDocumentListParams(
  filters: Record<string, string>,
  page: number,
  perPage: number,
): DocumentListParams {
  const params: DocumentListParams = { page, per_page: perPage }

  const q = filters.q?.trim()
  if (q) {
    params.q = q
  }

  const categoryId = positiveInteger(filters.category_id)
  if (categoryId !== undefined) {
    params.category_id = categoryId
  }

  const accessLevel = filters.access_level
  if (accessLevel !== undefined && ACCESS_LEVELS.has(accessLevel)) {
    params.access_level = accessLevel as AccessLevel
  }

  const state = filters.state
  if (state !== undefined && STATES.has(state)) {
    params.state = state as DocumentState | 'all'
  }

  if (filters.date_from) {
    params.date_from = filters.date_from
  }

  if (filters.date_to) {
    params.date_to = filters.date_to
  }

  return params
}
