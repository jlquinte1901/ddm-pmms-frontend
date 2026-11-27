import { Link } from 'react-router-dom'
import { Archive, ArchiveRestore } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatBytes, formatDate } from '@/shared/lib/formatters'
import type { Document } from '@/shared/types/api'
import {
  ACCESS_LEVEL_BADGE_CLASS,
  ACCESS_LEVEL_LABELS,
  DOCUMENT_STATE_BADGE_CLASS,
  DOCUMENT_STATE_LABELS,
} from '../accessMeta'
import { DocumentDownloadButton } from './DocumentDownloadButton'

type DocumentsTableProps = {
  documents: Document[]
  canArchive: boolean
  canRequest: boolean
  busyId: number | null
  onArchive: (document: Document) => void
  onUnarchive: (document: Document) => void
}

export function DocumentsTable({
  documents,
  canArchive,
  canRequest,
  busyId,
  onArchive,
  onUnarchive,
}: DocumentsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <caption className="sr-only">Documents in the repository</caption>
        <thead className="bg-muted/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
          <tr>
            <th scope="col" className="px-4 py-2 font-medium">
              Document
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Access
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              State
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Latest version
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Document date
            </th>
            <th scope="col" className="px-4 py-2 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {documents.map((document) => {
            const busy = busyId === document.id

            return (
              <tr key={document.id} className="align-top">
                <td className="px-4 py-3">
                  <Link
                    to={`/ddm/documents/${document.id}`}
                    className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {document.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {document.reference_no ?? 'No reference number'}
                  </p>
                  {document.category ? (
                    <p className="text-xs text-muted-foreground">
                      {document.category.name}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className={
                      ACCESS_LEVEL_BADGE_CLASS[document.effective_access_level]
                    }
                  >
                    {ACCESS_LEVEL_LABELS[document.effective_access_level]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={DOCUMENT_STATE_BADGE_CLASS[document.state]}>
                    {DOCUMENT_STATE_LABELS[document.state]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <p className="text-foreground">
                    v{document.latest_version_number}
                  </p>
                  {document.latest_version ? (
                    <p className="text-xs text-muted-foreground">
                      {document.latest_version.original_name} &middot;{' '}
                      {formatBytes(document.latest_version.file_size)}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {formatDate(document.document_date)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    <DocumentDownloadButton
                      document={document}
                      canRequest={canRequest}
                    />
                    {canArchive && document.state !== 'deleted' ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          document.is_archived
                            ? onUnarchive(document)
                            : onArchive(document)
                        }
                      >
                        {document.is_archived ? (
                          <ArchiveRestore aria-hidden="true" />
                        ) : (
                          <Archive aria-hidden="true" />
                        )}
                        {document.is_archived ? 'Unarchive' : 'Archive'}
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
