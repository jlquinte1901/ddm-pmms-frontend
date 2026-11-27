import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/shared/api/errors'
import { usePermission } from '@/shared/auth/usePermission'
import { PageHeader } from '@/shared/components/PageHeader'
import { Pagination } from '@/shared/components/Pagination'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/states'
import { useToast } from '@/shared/components/toast/toast-context'
import { useUrlFilters } from '@/shared/hooks/useUrlFilters'
import { PERMISSIONS } from '@/shared/lib/permissions'
import type { Document } from '@/shared/types/api'
import { DocumentFilters } from '../components/DocumentFilters'
import { DocumentsTable } from '../components/DocumentsTable'
import { useDocumentCategories } from '../hooks/useDocumentCategories'
import {
  useArchiveDocument,
  useUnarchiveDocument,
} from '../hooks/useDocumentMutations'
import { useDocuments } from '../hooks/useDocuments'
import { toDocumentListParams } from '../params'

export function DocumentsPage() {
  const toast = useToast()
  const {
    filters,
    setFilters,
    clearFilters,
    page,
    perPage,
    setPage,
    hasFilters,
  } = useUrlFilters()

  const params = toDocumentListParams(filters, page, perPage)
  const { data, isPending, isError, error, refetch } = useDocuments(params)
  const categoriesQuery = useDocumentCategories()

  const canUpload = usePermission(PERMISSIONS.DDM_DOCUMENTS_UPLOAD)
  const canArchive = usePermission(PERMISSIONS.DDM_DOCUMENTS_ARCHIVE)
  const canRequest = usePermission(PERMISSIONS.DDM_DOWNLOADS_REQUEST)
  const canViewDeleted = usePermission(PERMISSIONS.DDM_DOCUMENTS_DELETE)

  const archiveMutation = useArchiveDocument()
  const unarchiveMutation = useUnarchiveDocument()
  const [busyId, setBusyId] = useState<number | null>(null)

  async function handleArchive(document: Document) {
    setBusyId(document.id)

    try {
      await archiveMutation.mutateAsync(document.id)
      toast.success('Document archived', document.title)
    } catch (archiveError) {
      toast.error('Archive failed', getErrorMessage(archiveError))
    } finally {
      setBusyId(null)
    }
  }

  async function handleUnarchive(document: Document) {
    setBusyId(document.id)

    try {
      await unarchiveMutation.mutateAsync(document.id)
      toast.success('Document restored', document.title)
    } catch (unarchiveError) {
      toast.error('Restore failed', getErrorMessage(unarchiveError))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Documents"
        description="The departmental document repository, filtered and paginated on the server."
        actions={
          <>
            {data ? (
              <p className="text-xs text-muted-foreground">
                {data.meta.total.toLocaleString('en-US')}{' '}
                {data.meta.total === 1 ? 'document' : 'documents'} in scope
              </p>
            ) : null}
            {canUpload ? (
              <Button asChild>
                <Link to="/ddm/documents/new">
                  <Plus aria-hidden="true" />
                  Upload document
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      <DocumentFilters
        filters={filters}
        categories={categoriesQuery.data?.data ?? []}
        canViewDeleted={canViewDeleted}
        hasFilters={hasFilters}
        onChange={setFilters}
        onClear={clearFilters}
      />

      {isPending ? (
        <LoadingState variant="table" label="Loading documents" />
      ) : null}

      {isError ? (
        <ErrorState
          error={error}
          title="Documents could not be loaded"
          onRetry={() => void refetch()}
        />
      ) : null}

      {data && data.data.length === 0 ? (
        <EmptyState
          title={
            hasFilters
              ? 'No documents match these filters'
              : 'No documents in the repository yet'
          }
          description={
            hasFilters
              ? 'Adjust or clear the filters to see other documents.'
              : 'Documents uploaded by the Data Management Section appear here.'
          }
          action={
            hasFilters ? (
              <Button type="button" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : canUpload ? (
              <Button asChild>
                <Link to="/ddm/documents/new">Upload document</Link>
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {data && data.data.length > 0 ? (
        <>
          <DocumentsTable
            documents={data.data}
            canArchive={canArchive}
            canRequest={canRequest}
            busyId={busyId}
            onArchive={(document) => void handleArchive(document)}
            onUnarchive={(document) => void handleUnarchive(document)}
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
