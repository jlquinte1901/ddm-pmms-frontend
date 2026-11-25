import { useState } from 'react'
import { Pagination } from '@/shared/components/Pagination'
import { ErrorState, LoadingState } from '@/shared/components/states'
import {
  formatDate,
  formatDateTime,
  formatProgress,
} from '@/shared/lib/formatters'
import { useProjectUpdates } from '../hooks/useProjectUpdates'

type ProgressReportsProps = {
  projectId: number
}

export function ProgressReports({ projectId }: ProgressReportsProps) {
  const [page, setPage] = useState(1)
  const { data, isPending, isError, error, refetch } = useProjectUpdates(
    projectId,
    page,
  )

  return (
    <section aria-labelledby="progress-reports-heading" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="progress-reports-heading"
          className="text-sm font-semibold text-foreground"
        >
          Progress reports
        </h2>
        {data ? (
          <p className="text-xs text-muted-foreground">
            {data.meta.total}{' '}
            {data.meta.total === 1 ? 'report' : 'reports'} recorded
          </p>
        ) : null}
      </div>

      {isPending ? (
        <LoadingState variant="table" label="Loading progress reports" />
      ) : null}

      {isError ? (
        <ErrorState
          error={error}
          title="Progress reports could not be loaded"
          onRetry={() => void refetch()}
        />
      ) : null}

      {data && data.data.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card px-4 py-6 text-center text-sm text-muted-foreground">
          No progress has been reported for this project yet.
        </p>
      ) : null}

      {data && data.data.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Progress reports for this project
              </caption>
              <thead className="bg-muted/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Report date
                  </th>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Progress
                  </th>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Accomplishment
                  </th>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Remarks
                  </th>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Reported by
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.data.map((update) => (
                  <tr key={update.id} className="align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {formatDate(update.report_date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums text-foreground">
                      {formatProgress(update.previous_progress)} &rarr;{' '}
                      {formatProgress(update.progress_percentage)}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {update.accomplishment ?? '\u2014'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {update.remarks ?? '\u2014'}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">
                        {update.reporter?.full_name ?? '\u2014'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(update.created_at)}
                      </p>
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
    </section>
  )
}
