import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/shared/components/states'
import {
  formatDate,
  formatDays,
  formatProgress,
} from '@/shared/lib/formatters'
import type { Project } from '@/shared/types/api'
import { getIndicatorMeta } from '../../shared/indicatorMeta'

function timeText(project: Project): string {
  if (project.indicator === 'paused' && project.days_paused !== null) {
    return `${project.days_paused} ${
      project.days_paused === 1 ? 'day' : 'days'
    } paused`
  }

  return formatDays(project.days_remaining)
}

type WatchlistTableProps = {
  projects: Project[]
}

export function WatchlistTable({ projects }: WatchlistTableProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        title="Nothing needs attention"
        description="Critical, overdue, and paused projects appear here as soon as they enter the watchlist."
      />
    )
  }

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Watchlist</h2>
        <p className="text-xs text-muted-foreground">
          Critical, overdue, and paused projects, soonest deadline first
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Projects requiring monitoring attention
          </caption>
          <thead className="bg-muted/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th scope="col" className="px-4 py-2 font-medium">
                Project
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Indicator
              </th>
              <th scope="col" className="px-4 py-2 text-right font-medium">
                Progress
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Deadline
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {projects.map((project) => {
              const meta = getIndicatorMeta(project.indicator)

              return (
                <tr key={project.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">
                      {project.project_name}
                    </p>
                    {project.contract_number ? (
                      <p className="text-xs text-muted-foreground">
                        {project.contract_number}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {project.status_label}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={meta.badgeClassName}>
                      {project.indicator_label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">
                    {formatProgress(project.progress_percentage)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(project.effective_finish_date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-foreground">
                    {timeText(project)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
