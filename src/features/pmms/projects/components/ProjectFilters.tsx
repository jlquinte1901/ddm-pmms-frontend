import type { FormEvent } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ProjectCategory, UserSummary } from '@/shared/types/api'
import type { UrlFilterValue, UrlFilters } from '@/shared/hooks/useUrlFilters'
import { INDICATOR_META } from '../../shared/indicatorMeta'
import { PROJECT_STATUS_LABELS, PROJECT_STATUSES } from '../types'

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30'

function yearOptions(): number[] {
  const currentYear = new Date().getFullYear()

  return Array.from({ length: 8 }, (_, index) => currentYear + 1 - index)
}

type ProjectFiltersProps = {
  filters: UrlFilters
  categories: ProjectCategory[]
  engineers: UserSummary[]
  hasFilters: boolean
  onChange: (values: Record<string, UrlFilterValue>) => void
  onClear: () => void
}

export function ProjectFilters({
  filters,
  categories,
  engineers,
  hasFilters,
  onChange,
  onClear,
}: ProjectFiltersProps) {
  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const value = new FormData(event.currentTarget).get('q')

    onChange({ q: typeof value === 'string' ? value.trim() : null })
  }

  return (
    <section
      aria-label="Project filters"
      className="rounded-xl border bg-card p-4"
    >
      <div className="flex flex-wrap items-end gap-3">
        <form
          role="search"
          onSubmit={handleSearch}
          className="flex min-w-[240px] flex-1 items-center gap-2"
        >
          <label htmlFor="project-search" className="sr-only">
            Search projects
          </label>
          <Input
            key={filters.q ?? ''}
            id="project-search"
            name="q"
            type="search"
            defaultValue={filters.q ?? ''}
            placeholder="Search name, contract no., location, contractor"
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label
              htmlFor="project-indicator"
              className="block text-xs font-medium text-muted-foreground"
            >
              Indicator
            </label>
            <select
              id="project-indicator"
              className={selectClassName}
              value={filters.indicator ?? ''}
              onChange={(event) =>
                onChange({ indicator: event.target.value || null })
              }
            >
              <option value="">All indicators</option>
              {INDICATOR_META.map((meta) => (
                <option key={meta.value} value={meta.value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="project-status"
              className="block text-xs font-medium text-muted-foreground"
            >
              Status
            </label>
            <select
              id="project-status"
              className={selectClassName}
              value={filters.status ?? ''}
              onChange={(event) =>
                onChange({ status: event.target.value || null })
              }
            >
              <option value="">All statuses</option>
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {PROJECT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="project-year"
              className="block text-xs font-medium text-muted-foreground"
            >
              Year
            </label>
            <select
              id="project-year"
              className={selectClassName}
              value={filters.implementation_year ?? ''}
              onChange={(event) =>
                onChange({ implementation_year: event.target.value || null })
              }
            >
              <option value="">All years</option>
              {yearOptions().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="project-category"
              className="block text-xs font-medium text-muted-foreground"
            >
              Category
            </label>
            <select
              id="project-category"
              className={selectClassName}
              value={filters.project_category_id ?? ''}
              onChange={(event) =>
                onChange({ project_category_id: event.target.value || null })
              }
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {engineers.length > 0 ? (
            <div className="space-y-1">
              <label
                htmlFor="project-assigned-pe"
                className="block text-xs font-medium text-muted-foreground"
              >
                Assigned PE
              </label>
              <select
                id="project-assigned-pe"
                className={selectClassName}
                value={filters.assigned_pe_id ?? ''}
                onChange={(event) =>
                  onChange({ assigned_pe_id: event.target.value || null })
                }
              >
                <option value="">All Project Engineers</option>
                {engineers.map((engineer) => (
                  <option key={engineer.id} value={engineer.id}>
                    {engineer.full_name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {hasFilters ? (
            <Button type="button" variant="ghost" onClick={onClear}>
              <SlidersHorizontal aria-hidden="true" />
              Clear filters
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
