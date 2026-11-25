import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from 'cn'
import {
  formatDate,
  formatMoney,
  formatProgress,
} from '@/shared/lib/formatters'
import type { Project } from '@/shared/types/api'
import { getIndicatorMeta } from '../../shared/indicatorMeta'
import type { ProjectSort, SortDirection } from '../types'

type SortHeaderProps = {
  column: ProjectSort
  label: string
  sort: ProjectSort | null
  direction: SortDirection
  onSort: (column: ProjectSort) => void
  align?: 'left' | 'right'
}

function SortHeader({
  column,
  label,
  sort,
  direction,
  onSort,
  align = 'left',
}: SortHeaderProps) {
  const active = sort === column
  const Icon = active
    ? direction === 'asc'
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown

  return (
    <th
      scope="col"
      aria-sort={
        active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'
      }
      className={cn('px-4 py-2 font-medium', align === 'right' && 'text-right')}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          'inline-flex items-center gap-1 whitespace-nowrap uppercase hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          align === 'right' && 'flex-row-reverse',
        )}
      >
        {label}
        <Icon
          aria-hidden="true"
          className={cn('size-3', active ? 'opacity-100' : 'opacity-50')}
        />
      </button>
    </th>
  )
}

type ProjectsTableProps = {
  projects: Project[]
  sort: ProjectSort | null
  direction: SortDirection
  onSort: (column: ProjectSort) => void
}

export function ProjectsTable({
  projects,
  sort,
  direction,
  onSort,
}: ProjectsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <caption className="sr-only">
          Projects within your access scope
        </caption>
        <thead className="bg-muted/60 text-left text-xs tracking-wide text-muted-foreground">
          <tr>
            <SortHeader
              column="project_name"
              label="Project"
              sort={sort}
              direction={direction}
              onSort={onSort}
            />
            <th scope="col" className="px-4 py-2 font-medium">
              Category
            </th>
            <SortHeader
              column="status"
              label="Status"
              sort={sort}
              direction={direction}
              onSort={onSort}
            />
            <th scope="col" className="px-4 py-2 font-medium">
              Indicator
            </th>
            <SortHeader
              column="progress_percentage"
              label="Progress"
              sort={sort}
              direction={direction}
              onSort={onSort}
              align="right"
            />
            <SortHeader
              column="effective_finish_date"
              label="Deadline"
              sort={sort}
              direction={direction}
              onSort={onSort}
            />
            <SortHeader
              column="contract_amount"
              label="Amount"
              sort={sort}
              direction={direction}
              onSort={onSort}
              align="right"
            />
          </tr>
        </thead>
        <tbody className="divide-y">
          {projects.map((project) => {
            const meta = getIndicatorMeta(project.indicator)

            return (
              <tr key={project.id} className="align-top">
                <td className="px-4 py-3">
                  <Link
                    to={`/pmms/projects/${project.id}`}
                    className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {project.project_name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {project.contract_number ?? 'No contract number'}
                  </p>
                  {project.location ? (
                    <p className="text-xs text-muted-foreground">
                      {project.location}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {project.category?.name ?? '\u2014'}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{project.status_label}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={meta.badgeClassName}>
                    {project.indicator_label}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <span className="tabular-nums text-foreground">
                      {formatProgress(project.progress_percentage)}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-16 overflow-hidden rounded-full bg-muted"
                    >
                      <span
                        className="block h-full rounded-full bg-primary"
                        style={{ width: `${project.progress_percentage}%` }}
                      />
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {formatDate(project.effective_finish_date)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums text-foreground">
                  {formatMoney(project.contract_amount)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
