import { useState } from 'react'
import { PageHeader } from '@/shared/components/PageHeader'
import { Pagination } from '@/shared/components/Pagination'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/states'
import { useCurrentUser } from '@/shared/auth/useCurrentUser'
import { usePermission } from '@/shared/auth/usePermission'
import { useUrlFilters } from '@/shared/hooks/useUrlFilters'
import { PERMISSIONS } from '@/shared/lib/permissions'
import type { DocumentDownloadRequest } from '@/shared/types/api'
import { useDownloadRequests } from '../../documents/hooks/useDownloadRequests'
import { DecisionSheet } from '../components/DecisionSheet'
import { DownloadRequestsTable } from '../components/DownloadRequestsTable'

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30'

type Decision = {
  mode: 'approve' | 'deny'
  request: DocumentDownloadRequest
}

export function DownloadRequestsPage() {
  const { filters, setFilters, clearFilters, page, perPage, setPage } =
    useUrlFilters()
  const { data: user } = useCurrentUser()

  const status = filters.status
  const { data, isPending, isError, error, refetch } = useDownloadRequests({
    status: status || undefined,
    page,
    per_page: perPage,
  })

  const canApproveRestricted = usePermission(
    PERMISSIONS.DDM_DOWNLOADS_APPROVE_RESTRICTED,
  )
  const canApproveConfidential = usePermission(
    PERMISSIONS.DDM_DOWNLOADS_APPROVE_CONFIDENTIAL,
  )

  const [decision, setDecision] = useState<Decision | null>(null)

  function canDecide(request: DocumentDownloadRequest): boolean {
    if (request.effective_status !== 'pending') {
      return false
    }

    if (user !== undefined && request.requester?.id === user.id) {
      return false
    }

    const level = request.document?.effective_access_level ?? 'restricted'

    return level === 'confidential'
      ? canApproveConfidential
      : canApproveRestricted
  }

  const hasFilters = status !== undefined

  return (
    <div className="space-y-5">
      <PageHeader
        title="Download requests"
        description="Requests for DDM documents. Approvers decide restricted and confidential requests here; nobody can approve their own."
        actions={
          data ? (
            <p className="text-xs text-muted-foreground">
              {data.meta.total.toLocaleString('en-US')}{' '}
              {data.meta.total === 1 ? 'request' : 'requests'} in view
            </p>
          ) : null
        }
      />

      <section aria-label="Download request filters" className="rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label
              htmlFor="download-request-status"
              className="block text-xs font-medium text-muted-foreground"
            >
              Status
            </label>
            <select
              id="download-request-status"
              className={selectClassName}
              value={status ?? ''}
              onChange={(event) =>
                setFilters({ status: event.target.value || null })
              }
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
              <option value="cancelled">Cancelled</option>
              <option value="lapsed">Lapsed</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {status ? (
            <button
              type="button"
              className="text-sm text-primary underline-offset-4 hover:underline"
              onClick={clearFilters}
            >
              Clear filter
            </button>
          ) : null}
        </div>
      </section>

      {isPending ? (
        <LoadingState variant="table" label="Loading download requests" />
      ) : null}

      {isError ? (
        <ErrorState
          error={error}
          title="Download requests could not be loaded"
          onRetry={() => void refetch()}
        />
      ) : null}

      {data && data.data.length === 0 ? (
        <EmptyState
          title={
            hasFilters
              ? 'No requests match this status'
              : 'No download requests yet'
          }
          description={
            hasFilters
              ? 'Clear the status filter to see all requests in your scope.'
              : 'Requests appear here when users ask to download a restricted or confidential document.'
          }
          action={
            hasFilters ? (
              <button
                type="button"
                className="text-sm text-primary underline-offset-4 hover:underline"
                onClick={clearFilters}
              >
                Clear filter
              </button>
            ) : undefined
          }
        />
      ) : null}

      {data && data.data.length > 0 ? (
        <>
          <DownloadRequestsTable
            requests={data.data}
            canDecide={canDecide}
            onDecide={(mode, request) => setDecision({ mode, request })}
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

      {decision ? (
        <DecisionSheet
          mode={decision.mode}
          request={decision.request}
          open
          onOpenChange={(open) => {
            if (!open) {
              setDecision(null)
            }
          }}
        />
      ) : null}
    </div>
  )
}
