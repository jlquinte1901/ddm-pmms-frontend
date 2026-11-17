import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export type UrlFilterValue = string | number | boolean | null | undefined
export type UrlFilters = Record<string, string>

const DEFAULT_PER_PAGE = 15
const MAX_PER_PAGE = 100

function normalizeValue(value: UrlFilterValue): string | null {
  if (value === null || value === undefined || value === false) {
    return null
  }

  const text = String(value).trim()

  return text === '' ? null : text
}

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

/**
 * Filters, search, sort, and pagination live in the URL so a view is
 * shareable, survives refresh, and drives the query key.
 */
export function useUrlFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo<UrlFilters>(
    () => Object.fromEntries(searchParams.entries()),
    [searchParams],
  )

  const setFilter = useCallback(
    (key: string, value: UrlFilterValue) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          const normalized = normalizeValue(value)

          if (normalized === null) {
            next.delete(key)
          } else {
            next.set(key, normalized)
          }

          if (key !== 'page') {
            next.delete('page')
          }

          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setFilters = useCallback(
    (values: Record<string, UrlFilterValue>) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)

          for (const [key, value] of Object.entries(values)) {
            const normalized = normalizeValue(value)

            if (normalized === null) {
              next.delete(key)
            } else {
              next.set(key, normalized)
            }
          }

          if (!Object.hasOwn(values, 'page')) {
            next.delete('page')
          }

          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const removeFilter = useCallback(
    (key: string) => {
      setFilter(key, null)
    },
    [setFilter],
  )

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  const page = positiveInteger(filters.page, 1)
  const perPage = Math.min(
    MAX_PER_PAGE,
    positiveInteger(filters.per_page, DEFAULT_PER_PAGE),
  )

  const setPage = useCallback(
    (value: number) => {
      setFilter('page', value <= 1 ? null : value)
    },
    [setFilter],
  )

  const setPerPage = useCallback(
    (value: number) => {
      const clamped = Math.min(MAX_PER_PAGE, Math.max(1, Math.trunc(value)))

      setFilters({ per_page: clamped, page: null })
    },
    [setFilters],
  )

  return {
    filters,
    setFilter,
    setFilters,
    removeFilter,
    clearFilters,
    hasFilters: Object.keys(filters).length > 0,
    page,
    perPage,
    setPage,
    setPerPage,
    maxPerPage: MAX_PER_PAGE,
  }
}
