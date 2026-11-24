import { PageHeader } from '@/shared/components/PageHeader'
import { Pagination } from '@/shared/components/Pagination'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/states'
import { Button } from '@/components/ui/button'
import { useUrlFilters } from '@/shared/hooks/useUrlFilters'
import { ProjectFilters } from '../components/ProjectFilters'
import { ProjectsTable } from '../components/ProjectsTable'
import { useProjectCategories } from '../hooks/useProjectCategories'
import { useProjects } from '../hooks/useProjects'
import {
  isProjectSort,
  isSortDirection,
  toProjectListParams,
} from '../params'
import type { ProjectSort } from '../types'

export function ProjectsPage() {
  const {
    filters,
    setFilters,
    clearFilters,
    page,
    perPage,
    setPage,
    hasFilters,
  } = useUrlFilters()

  const params = toProjectListParams(filters, page, perPage)
  const { data, isPending, isError, error, refetch } = useProjects(params)
  const categoriesQuery = useProjectCategories()

  const sort = isProjectSort(filters.sort) ? filters.sort : null
  const direction = isSortDirection(filters.direction)
    ? filters.direction
    : 'desc'

  function handleSort(column: ProjectSort) {
    if (sort === column) {
      setFilters({ direction: direction === 'asc' ? 'desc' : 'asc' })
      return
    }

    setFilters({
      sort: column,
      direction: column === 'project_name' ? 'asc' : 'desc',
    })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Projects"
        description="The project registry, filtered and paginated on the server."
        actions={
          data ? (
            <p className="text-xs text-muted-foreground">
              {data.meta.total.toLocaleString('en-US')}{' '}
              {data.meta.total === 1 ? 'project' : 'projects'} in scope
            </p>
          ) : null
        }
      />

      <ProjectFilters
        filters={filters}
        categories={categoriesQuery.data?.data ?? []}
        hasFilters={hasFilters}
        onChange={setFilters}
        onClear={clearFilters}
      />

      {isPending ? <LoadingState variant="table" label="Loading projects" /> : null}

      {isError ? (
        <ErrorState
          error={error}
          title="Projects could not be loaded"
          onRetry={() => void refetch()}
        />
      ) : null}

      {data && data.data.length === 0 ? (
        <EmptyState
          title="No projects match these filters"
          description={
            hasFilters
              ? 'Adjust or clear the filters to see other projects.'
              : 'Projects appear here as Project Engineers register them.'
          }
          action={
            hasFilters ? (
              <Button type="button" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {data && data.data.length > 0 ? (
        <>
          <ProjectsTable
            projects={data.data}
            sort={sort}
            direction={direction}
            onSort={handleSort}
          />
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
    </div>
  )
}
