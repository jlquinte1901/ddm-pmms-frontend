import { useState, type FormEvent } from 'react'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePermission } from '@/shared/auth/usePermission'
import { PageHeader } from '@/shared/components/PageHeader'
import { Pagination } from '@/shared/components/Pagination'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/states'
import { useUrlFilters } from '@/shared/hooks/useUrlFilters'
import { PERMISSIONS } from '@/shared/lib/permissions'
import type { DocumentCategory } from '@/shared/types/api'
import {
  ACCESS_LEVEL_BADGE_CLASS,
  ACCESS_LEVEL_LABELS,
} from '../../documents/accessMeta'
import { CategoryFormSheet } from '../components/CategoryFormSheet'
import { useCategories } from '../hooks/useCategories'
import { toCategoryListParams } from '../params'

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30'

export function CategoriesPage() {
  const {
    filters,
    setFilters,
    clearFilters,
    page,
    perPage,
    setPage,
    hasFilters,
  } = useUrlFilters()

  const params = toCategoryListParams(filters, page, perPage)
  const { data, isPending, isError, error, refetch } = useCategories(params)
  const canManage = usePermission(PERMISSIONS.DDM_CATEGORIES_MANAGE)

  const [editing, setEditing] = useState<DocumentCategory | 'new' | null>(null)

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const value = new FormData(event.currentTarget).get('q')

    setFilters({ q: typeof value === 'string' ? value.trim() : null })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Document categories"
        description="Categories define the default access level for the documents filed under them."
        actions={
          <>
            {data ? (
              <p className="text-xs text-muted-foreground">
                {data.meta.total.toLocaleString('en-US')}{' '}
                {data.meta.total === 1 ? 'category' : 'categories'}
              </p>
            ) : null}
            {canManage ? (
              <Button type="button" onClick={() => setEditing('new')}>
                <Plus aria-hidden="true" />
                New category
              </Button>
            ) : null}
          </>
        }
      />

      <section
        aria-label="Category filters"
        className="rounded-xl border bg-card p-4"
      >
        <div className="flex flex-wrap items-end gap-3">
          <form
            role="search"
            onSubmit={handleSearch}
            className="flex min-w-[240px] flex-1 items-center gap-2"
          >
            <label htmlFor="category-search" className="sr-only">
              Search categories
            </label>
            <Input
              key={filters.q ?? ''}
              id="category-search"
              name="q"
              type="search"
              defaultValue={filters.q ?? ''}
              placeholder="Search categories"
            />
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>

          <div className="space-y-1">
            <label
              htmlFor="category-status"
              className="block text-xs font-medium text-muted-foreground"
            >
              Status
            </label>
            <select
              id="category-status"
              className={selectClassName}
              value={filters.is_active ?? ''}
              onChange={(event) =>
                setFilters({ is_active: event.target.value || null })
              }
            >
              <option value="">All statuses</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          {hasFilters ? (
            <Button type="button" variant="ghost" onClick={clearFilters}>
              <SlidersHorizontal aria-hidden="true" />
              Clear filters
            </Button>
          ) : null}
        </div>
      </section>

      {isPending ? (
        <LoadingState variant="table" label="Loading document categories" />
      ) : null}

      {isError ? (
        <ErrorState
          error={error}
          title="Document categories could not be loaded"
          onRetry={() => void refetch()}
        />
      ) : null}

      {data && data.data.length === 0 ? (
        <EmptyState
          title={
            hasFilters
              ? 'No categories match these filters'
              : 'No document categories yet'
          }
          description={
            hasFilters
              ? 'Adjust or clear the filters to see other categories.'
              : 'Create a category before uploading documents.'
          }
          action={
            hasFilters ? (
              <Button type="button" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : canManage ? (
              <Button type="button" onClick={() => setEditing('new')}>
                New category
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {data && data.data.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <caption className="sr-only">DDM document categories</caption>
              <thead className="bg-muted/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Default access
                  </th>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">
                    Documents
                  </th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.data.map((category) => (
                  <tr key={category.id} className="align-top">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {category.name}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          ACCESS_LEVEL_BADGE_CLASS[
                            category.default_access_level
                          ]
                        }
                      >
                        {ACCESS_LEVEL_LABELS[category.default_access_level]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          category.is_active
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-slate-200 text-slate-800'
                        }
                      >
                        {category.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {category.documents_count ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canManage ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(category)}
                        >
                          Edit
                        </Button>
                      ) : (
                        '\u2014'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={data.meta.current_page}
            lastPage={data.meta.last_page}
            total={data.meta.total}
            from={data.meta.from}
            to={data.meta.to}
            onPageChange={setPage}
          />
        </>
      ) : null}

      {editing !== null ? (
        <CategoryFormSheet
          key={editing === 'new' ? 'new' : editing.id}
          category={editing === 'new' ? null : editing}
          open
          onOpenChange={(open) => {
            if (!open) {
              setEditing(null)
            }
          }}
        />
      ) : null}
    </div>
  )
}
