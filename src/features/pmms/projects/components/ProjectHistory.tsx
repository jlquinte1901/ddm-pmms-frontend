import { useState } from 'react'
import { Pagination } from '@/shared/components/Pagination'
import { ErrorState, LoadingState } from '@/shared/components/states'
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatProgress,
} from '@/shared/lib/formatters'
import { useProjectHistory } from '../hooks/useProjectHistory'
import type { ProjectHistoryEntry } from '../types'

const ACTION_LABELS: Record<string, string> = {
  created: 'Project registered',
  updated: 'Project details updated',
  started: 'Project started',
  progress_updated: 'Progress updated',
  progress_reported: 'Progress reported',
  completed: 'Project completed',
  suspended: 'Project suspended',
  postponed: 'Project postponed',
  resumed: 'Project resumed',
  terminated: 'Project terminated',
  reopened: 'Project reopened',
  reassigned: 'Project Engineer reassigned',
  planned_dates_corrected: 'Planned dates corrected',
  deleted: 'Project deleted',
  restored: 'Project restored',
}

const FIELD_LABELS: Record<string, string> = {
  project_category_id: 'Category',
  assigned_pe_id: 'Assigned Project Engineer',
  created_by: 'Created by',
  implementation_year: 'Implementation year',
  project_name: 'Project name',
  contract_number: 'Contract number',
  location: 'Location',
  region: 'Region',
  lgu: 'LGU',
  department: 'Department',
  implementing_office: 'Implementing office',
  project_manager: 'Project manager',
  fund_source: 'Fund source',
  contract_amount: 'Contract amount',
  revised_amount: 'Revised amount',
  planned_start_date: 'Planned start date',
  planned_finish_date: 'Planned finish date',
  revised_finish_date: 'Revised finish date',
  actual_start_date: 'Actual start date',
  actual_finish_date: 'Actual finish date',
  contractor: 'Contractor',
  status: 'Status',
  progress_percentage: 'Progress',
  paused_since: 'Paused since',
  completed_at: 'Completed at',
  remarks: 'Remarks',
}

function humanize(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? humanize(action)
}

function fieldLabel(field: string | null): string {
  if (field === null) {
    return 'Field'
  }

  return FIELD_LABELS[field] ?? humanize(field)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function displayValue(field: string | null, value: unknown): string {
  if (value === null || value === undefined) {
    return '\u2014'
  }

  if (typeof value === 'string') {
    if (value === '') {
      return '\u2014'
    }

    if (field !== null && field.includes('amount')) {
      return formatMoney(value)
    }

    if (field !== null && (field.endsWith('_date') || field === 'paused_since')) {
      return formatDate(value)
    }

    if (field !== null && field.endsWith('_at')) {
      return formatDateTime(value)
    }

    if (field === 'status') {
      return humanize(value)
    }

    return value
  }

  if (typeof value === 'number') {
    return field === 'progress_percentage'
      ? formatProgress(value)
      : String(value)
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (Array.isArray(value)) {
    return value.map((item) => displayValue(field, item)).join(', ')
  }

  return '\u2014'
}

function eventSummary(action: string, value: unknown): string | null {
  if (action === 'created') {
    return 'Initial project record created.'
  }

  if (action === 'progress_reported' && isRecord(value)) {
    const progress = value.progress_percentage
    const reportDate = value.report_date

    if (typeof progress === 'number' && typeof reportDate === 'string') {
      return `Progress reported at ${formatProgress(progress)} for ${formatDate(reportDate)}.`
    }

    return 'Progress report recorded.'
  }

  return null
}

type HistoryGroup = {
  key: string
  action: string
  actor: string | null
  reason: string | null
  createdAt: string | null
  entries: ProjectHistoryEntry[]
}

function groupHistory(entries: ProjectHistoryEntry[]): HistoryGroup[] {
  const groups = new Map<string, HistoryGroup>()
  const order: string[] = []

  for (const entry of entries) {
    const key = entry.change_set_id ?? `entry-${entry.id}`
    const existing = groups.get(key)

    if (existing) {
      existing.entries.push(entry)
      continue
    }

    groups.set(key, {
      key,
      action: entry.action,
      actor: entry.actor?.full_name ?? null,
      reason: entry.reason,
      createdAt: entry.created_at,
      entries: [entry],
    })
    order.push(key)
  }

  return order.flatMap((key) => {
    const group = groups.get(key)

    return group ? [group] : []
  })
}

type ProjectHistoryProps = {
  projectId: number
}

export function ProjectHistory({ projectId }: ProjectHistoryProps) {
  const [page, setPage] = useState(1)
  const { data, isPending, isError, error, refetch } = useProjectHistory(
    projectId,
    page,
  )

  const groups = data ? groupHistory(data.data) : []

  return (
    <section aria-labelledby="project-history-heading" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="project-history-heading"
          className="text-sm font-semibold text-foreground"
        >
          Project history
        </h2>
        {data ? (
          <p className="text-xs text-muted-foreground">
            {data.meta.total}{' '}
            {data.meta.total === 1 ? 'change' : 'changes'} recorded
          </p>
        ) : null}
      </div>

      {isPending ? (
        <LoadingState variant="table" label="Loading project history" />
      ) : null}

      {isError ? (
        <ErrorState
          error={error}
          title="Project history could not be loaded"
          onRetry={() => void refetch()}
        />
      ) : null}

      {data && data.data.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card px-4 py-6 text-center text-sm text-muted-foreground">
          No history has been recorded for this project yet.
        </p>
      ) : null}

      {data && groups.length > 0 ? (
        <>
          <ol className="space-y-3">
            {groups.map((group) => {
              const changes = group.entries.filter(
                (entry) => entry.field_name !== null,
              )
              const summary = eventSummary(
                group.action,
                group.entries[0]?.new_value,
              )

              return (
                <li
                  key={group.key}
                  className="rounded-xl border bg-card p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {actionLabel(group.action)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(group.createdAt)}
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {group.actor ? `By ${group.actor}` : 'Actor unavailable'}
                  </p>

                  {changes.length > 0 ? (
                    <dl className="mt-3 space-y-1.5">
                      {changes.map((entry) => (
                        <div key={entry.id} className="text-sm">
                          <dt className="inline font-medium text-foreground">
                            {fieldLabel(entry.field_name)}:{' '}
                          </dt>
                          <dd className="inline text-muted-foreground">
                            <span className="text-foreground">
                              {displayValue(
                                entry.field_name,
                                entry.previous_value,
                              )}
                            </span>
                            {' \u2192 '}
                            <span className="text-foreground">
                              {displayValue(entry.field_name, entry.new_value)}
                            </span>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : summary ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {summary}
                    </p>
                  ) : null}

                  {group.reason ? (
                    <p className="mt-3 rounded-md bg-muted/60 px-3 py-2 text-sm text-foreground">
                      <span className="font-medium">Reason:</span>{' '}
                      {group.reason}
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ol>
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
