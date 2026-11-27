import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Plus,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getErrorMessage, isApiError } from '@/shared/api/errors'
import { usePermission } from '@/shared/auth/usePermission'
import { PageHeader } from '@/shared/components/PageHeader'
import {
  ErrorState,
  LoadingState,
  NotFoundState,
} from '@/shared/components/states'
import { useToast } from '@/shared/components/toast/toast-context'
import { formatDate, formatDateTime } from '@/shared/lib/formatters'
import { PERMISSIONS } from '@/shared/lib/permissions'
import {
  ACCESS_LEVEL_BADGE_CLASS,
  ACCESS_LEVEL_LABELS,
  DOCUMENT_STATE_BADGE_CLASS,
  DOCUMENT_STATE_LABELS,
} from '../accessMeta'
import { AddVersionSheet } from '../components/AddVersionSheet'
import { DeleteDocumentSheet } from '../components/DeleteDocumentSheet'
import { DocumentDownloadButton } from '../components/DocumentDownloadButton'
import { DocumentVersions } from '../components/DocumentVersions'
import { useDocument } from '../hooks/useDocument'
import {
  useArchiveDocument,
  useUnarchiveDocument,
} from '../hooks/useDocumentMutations'

function StatCard({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 text-lg font-semibold tracking-tight text-foreground">
        {children}
      </div>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-sm break-words text-foreground">{value}</dd>
    </div>
  )
}

export function DocumentDetailPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { documentId: documentIdParam } = useParams()
  const parsedId = Number.parseInt(documentIdParam ?? '', 10)
  const documentId =
    Number.isInteger(parsedId) && String(parsedId) === documentIdParam
      ? parsedId
      : 0

  const { data: document, isPending, isError, error, refetch } = useDocument(
    documentId,
  )
  const archiveMutation = useArchiveDocument()
  const unarchiveMutation = useUnarchiveDocument()

  const canRequest = usePermission(PERMISSIONS.DDM_DOWNLOADS_REQUEST)
  const canArchive = usePermission(PERMISSIONS.DDM_DOCUMENTS_ARCHIVE)
  const canUpload = usePermission(PERMISSIONS.DDM_DOCUMENTS_UPLOAD)
  const canDelete = usePermission(PERMISSIONS.DDM_DOCUMENTS_DELETE)

  const [addVersionOpen, setAddVersionOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const backButton = (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-2"
      onClick={() => navigate('/ddm/documents')}
    >
      <ArrowLeft aria-hidden="true" />
      Documents
    </Button>
  )

  if (documentId <= 0) {
    return (
      <div className="space-y-5">
        {backButton}
        <NotFoundState
          title="Document not found"
          description="The document identifier is not valid."
        />
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="space-y-5">
        {backButton}
        <LoadingState label="Loading document" />
      </div>
    )
  }

  if (isError) {
    if (isApiError(error) && error.isNotFound) {
      return (
        <div className="space-y-5">
          {backButton}
          <NotFoundState
            title="Document not found"
            description="This document does not exist, or it is outside your access scope."
          />
        </div>
      )
    }

    return (
      <div className="space-y-5">
        {backButton}
        <ErrorState
          error={error}
          title="The document could not be loaded"
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  if (!document) {
    return null
  }

  async function handleArchive() {
    if (!document) {
      return
    }

    try {
      await archiveMutation.mutateAsync(document.id)
      toast.success('Document archived', document.title)
    } catch (archiveError) {
      toast.error('Archive failed', getErrorMessage(archiveError))
    }
  }

  async function handleUnarchive() {
    if (!document) {
      return
    }

    try {
      await unarchiveMutation.mutateAsync(document.id)
      toast.success('Document restored', document.title)
    } catch (unarchiveError) {
      toast.error('Restore failed', getErrorMessage(unarchiveError))
    }
  }

  const archiving = archiveMutation.isPending || unarchiveMutation.isPending

  return (
    <div className="space-y-5">
      {backButton}

      <PageHeader
        title={document.title}
        description={[
          document.category?.name,
          document.reference_no,
          document.document_date ? `Dated ${formatDate(document.document_date)}` : null,
        ]
          .filter((part): part is string => Boolean(part))
          .join(' \u00b7 ')}
        actions={
          <div className="flex flex-wrap gap-2">
            <DocumentDownloadButton
              document={document}
              canRequest={canRequest}
            />
            {canArchive ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={archiving}
                onClick={() =>
                  void (document.is_archived ? handleUnarchive() : handleArchive())
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
            {canUpload ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddVersionOpen(true)}
              >
                <Plus aria-hidden="true" />
                New version
              </Button>
            ) : null}
            {canDelete ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 aria-hidden="true" />
                Delete
              </Button>
            ) : null}
          </div>
        }
      />

      <section
        aria-label="Document summary"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard label="Access level">
          <Badge
            className={ACCESS_LEVEL_BADGE_CLASS[document.effective_access_level]}
          >
            {ACCESS_LEVEL_LABELS[document.effective_access_level]}
          </Badge>
        </StatCard>
        <StatCard label="State">
          <Badge className={DOCUMENT_STATE_BADGE_CLASS[document.state]}>
            {DOCUMENT_STATE_LABELS[document.state]}
          </Badge>
        </StatCard>
        <StatCard
          label="Latest version"
          hint={document.latest_version?.original_name}
        >
          v{document.latest_version_number}
        </StatCard>
        <StatCard label="Document date">
          {formatDate(document.document_date)}
        </StatCard>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Details</h2>
        <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Category"
            value={document.category?.name ?? '\u2014'}
          />
          <InfoItem
            label="Reference number"
            value={document.reference_no ?? '\u2014'}
          />
          <InfoItem
            label="Uploaded by"
            value={document.creator?.full_name ?? '\u2014'}
          />
          <InfoItem
            label="Uploaded at"
            value={formatDateTime(document.created_at)}
          />
          <InfoItem
            label="Archived at"
            value={formatDateTime(document.archived_at)}
          />
          <InfoItem
            label="Last updated"
            value={formatDateTime(document.updated_at)}
          />
          <InfoItem
            label="Description"
            value={document.description ?? '\u2014'}
          />
          <InfoItem label="Remarks" value={document.remarks ?? '\u2014'} />
        </dl>
      </section>

      <section aria-labelledby="document-versions-heading" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="document-versions-heading"
            className="text-sm font-semibold text-foreground"
          >
            Versions
          </h2>
          <p className="text-xs text-muted-foreground">
            {document.versions?.length ?? 0}{' '}
            {document.versions?.length === 1 ? 'version' : 'versions'}
          </p>
        </div>
        <DocumentVersions versions={document.versions ?? []} />
      </section>

      {canUpload ? (
        <AddVersionSheet
          documentId={document.id}
          open={addVersionOpen}
          onOpenChange={setAddVersionOpen}
        />
      ) : null}

      {canDelete ? (
        <DeleteDocumentSheet
          documentId={document.id}
          title={document.title}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onDeleted={() => navigate('/ddm/documents')}
        />
      ) : null}
    </div>
  )
}
