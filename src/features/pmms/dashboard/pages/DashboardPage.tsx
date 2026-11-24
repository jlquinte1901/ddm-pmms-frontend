import { PageHeader } from '@/shared/components/PageHeader'
import { ErrorState, LoadingState } from '@/shared/components/states'
import {
  formatDateTime,
  formatMoney,
  formatProgress,
} from '@/shared/lib/formatters'
import { DistributionList } from '../components/DistributionList'
import { IndicatorCard } from '../components/IndicatorCard'
import { SummaryCard } from '../components/SummaryCard'
import { WatchlistTable } from '../components/WatchlistTable'
import { useDashboard } from '../hooks/useDashboard'
import { INDICATOR_META } from '../../shared/indicatorMeta'

export function DashboardPage() {
  const { data, isPending, isError, error, refetch } = useDashboard()

  return (
    <div className="space-y-6">
      <PageHeader
        title="PMMS dashboard"
        description="Monitoring counts, the critical watchlist, and project summaries."
        actions={
          data ? (
            <p className="text-xs text-muted-foreground">
              Updated {formatDateTime(data.generated_at)}
            </p>
          ) : null
        }
      />

      {isPending ? <LoadingState /> : null}

      {isError ? (
        <ErrorState
          error={error}
          title="The dashboard could not be loaded"
          onRetry={() => void refetch()}
        />
      ) : null}

      {data ? (
        <>
          {data.counts.total === 0 ? (
            <p className="rounded-xl border border-dashed bg-card px-4 py-3 text-sm text-muted-foreground">
              No projects have been recorded yet. These counts update
              automatically as Project Engineers register projects.
            </p>
          ) : null}

          <section aria-labelledby="dashboard-summary-heading">
            <h2 id="dashboard-summary-heading" className="sr-only">
              Project summary
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                label="Total projects"
                value={data.counts.total.toLocaleString('en-US')}
                hint="Within your access scope"
              />
              <SummaryCard
                label="Average progress"
                value={formatProgress(data.average_progress)}
                hint="Across all matching projects"
              />
              <SummaryCard
                label="Contract amount"
                value={formatMoney(data.totals.contract_amount)}
                hint="Sum of contract amounts"
              />
              <SummaryCard
                label="Revised amount"
                value={formatMoney(data.totals.revised_amount)}
                hint="Sum of revised amounts"
              />
            </div>
          </section>

          <section aria-labelledby="dashboard-indicator-heading">
            <h2
              id="dashboard-indicator-heading"
              className="text-sm font-semibold text-foreground"
            >
              Monitoring indicators
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {INDICATOR_META.map((meta) => (
                <IndicatorCard
                  key={meta.value}
                  meta={meta}
                  count={data.counts.by_indicator[meta.value]}
                />
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <WatchlistTable projects={data.watchlist} />
            </div>
            <div className="space-y-6">
              <DistributionList
                title="Projects by category"
                items={data.by_category.map((row) => ({
                  label: row.category,
                  count: row.count,
                }))}
                emptyLabel="No categories have projects yet."
              />
              <DistributionList
                title="Projects by implementation year"
                items={data.by_year.map((row) => ({
                  label: String(row.implementation_year),
                  count: row.count,
                }))}
                emptyLabel="No implementation years recorded yet."
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
