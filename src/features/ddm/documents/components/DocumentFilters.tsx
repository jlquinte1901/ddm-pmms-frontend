import type { FormEvent } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { DocumentCategory } from '@/shared/types/api'
import type { UrlFilterValue, UrlFilters } from '@/shared/hooks/useUrlFilters'
import { ACCESS_LEVEL_LABELS } from '../accessMeta'

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30'

type DocumentFiltersProps = {
  filters: UrlFilters
  categories: DocumentCategory[]
  canViewDeleted: boolean
  hasFilters: boolean
  onChange: (values: Record<string, UrlFilterValue>) => void
  onClear: () => void
}

export function DocumentFilters({
  filters,
  categories,
  canViewDeleted,
  hasFilters,
  onChange,
  onClear,
}: DocumentFiltersProps) {
  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const value = new FormData(event.currentTarget).get('q')

    onChange({ q: typeof value === 'string' ? value.trim() : null })
  }

  return (
    <section aria-label="Document filters" className="rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-3">
        <form
          role="search"
          onSubmit={handleSearch}
          className="flex items-center gap-2"
        >
          <label htmlFor="document-search" className="sr-only">
            Search documents
          </label>
          <Input
            key={filters.q ?? ''}
            id="document-search"
            name="q"
            type="search"
            defaultValue={filters.q ?? ''}
            placeholder="Search title, reference no., description"
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label
              htmlFor="document-category"
              className="block text-xs font-medium text-muted-foreground"
            >
              Category
            </label>
            <select
              id="document-category"
              className={selectClassName}
              value={filters.category_id ?? ''}
              onChange={(event) =>
                onChange({ category_id: event.target.value || null })
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

          <div className="space-y-1">
            <label
              htmlFor="document-access-level"
              className="block text-xs font-medium text-muted-foreground"
            >
              Access level
            </label>
            <select
              id="document-access-level"
              className={selectClassName}
              value={filters.access_level ?? ''}
              onChange={(event) =>
                onChange({ access_level: event.target.value || null })
              }
            >
              <option value="">All access levels</option>
              {Object.entries(ACCESS_LEVEL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="document-state"
              className="block text-xs font-medium text-muted-foreground"
            >
              State
            </label>
            <select
              id="document-state"
              className={selectClassName}
              value={filters.state ?? ''}
              onChange={(event) =>
                onChange({ state: event.target.value || null })
              }
            >
              <option value="">Active</option>
              <option value="archived">Archived</option>
              {canViewDeleted ? (
                <option value="deleted">Deleted</option>
              ) : null}
              <option value="all">All states</option>
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="document-date-from"
              className="block text-xs font-medium text-muted-foreground"
            >
              From
            </label>
            <Input
              id="document-date-from"
              type="date"
              className="w-auto"
              value={filters.date_from ?? ''}
              onChange={(event) =>
                onChange({ date_from: event.target.value || null })
              }
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="document-date-to"
              className="block text-xs font-medium text-muted-foreground"
            >
              To
            </label>
            <Input
              id="document-date-to"
              type="date"
              className="w-auto"
              value={filters.date_to ?? ''}
              onChange={(event) =>
                onChange({ date_to: event.target.value || null })
              }
            />
          </div>

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
