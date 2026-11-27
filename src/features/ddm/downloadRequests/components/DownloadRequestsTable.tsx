import { Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/shared/lib/formatters'
import type { DocumentDownloadRequest } from '@/shared/types/api'
import {
  ACCESS_LEVEL_BADGE_CLASS,
  ACCESS_LEVEL_LABELS,
} from '../../documents/accessMeta'
import {
  REQUEST_STATUS_BADGE_CLASS,
  REQUEST_STATUS_LABELS,
} from '../statusMeta'

type DownloadRequestsTableProps = {
  requests: DocumentDownloadRequest[]
  canDecide: (request: DocumentDownloadRequest) => boolean
  onDecide: (
    mode: 'approve' | 'deny',
    request: DocumentDownloadRequest,
  ) => void
}

export function DownloadRequestsTable({
  requests,
  canDecide,
  onDecide,
}: DownloadRequestsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <caption className="sr-only">Document download requests</caption>
        <thead className="bg-muted/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
          <tr>
            <th scope="col" className="px-4 py-2 font-medium">
              Document
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Requester
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Reason
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Requested
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Decision
            </th>
            <th scope="col" className="px-4 py-2 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {requests.map((request) => {
            const accessLevel =
              request.document?.effective_access_level ?? 'restricted'
            const decidable = canDecide(request)

            return (
              <tr key={request.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">
                    {request.document?.title ?? 'Document unavailable'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {request.document?.reference_no ?? 'No reference number'}
                  </p>
                  <Badge className={ACCESS_LEVEL_BADGE_CLASS[accessLevel]}>
                    {ACCESS_LEVEL_LABELS[accessLevel]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {request.requester?.full_name ?? '\u2014'}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className={
                      REQUEST_STATUS_BADGE_CLASS[request.effective_status]
                    }
                  >
                    {REQUEST_STATUS_LABELS[request.effective_status]}
                  </Badge>
                </td>
                <td className="max-w-xs px-4 py-3 text-muted-foreground">
                  <p className="break-words">{request.reason}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {formatDateTime(request.created_at)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {request.decided_at ? (
                    <>
                      <p className="text-foreground">
                        {request.decider?.full_name ?? '\u2014'}
                      </p>
                      <p className="text-xs">
                        {formatDateTime(request.decided_at)}
                      </p>
                      {request.expires_at ? (
                        <p className="text-xs">
                          Expires {formatDateTime(request.expires_at)}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    '\u2014'
                  )}
                </td>
                <td className="px-4 py-3">
                  {decidable ? (
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onDecide('approve', request)}
                      >
                        <Check aria-hidden="true" />
                        Approve
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDecide('deny', request)}
                      >
                        <X aria-hidden="true" />
                        Deny
                      </Button>
                    </div>
                  ) : (
                    <p className="text-right text-muted-foreground">
                      {request.effective_status === 'pending'
                        ? 'Awaiting approver'
                        : '\u2014'}
                    </p>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
