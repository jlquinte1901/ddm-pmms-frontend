import { apiClient } from '@/shared/api/client'
import type {
  Document,
  DocumentCategory,
  DocumentDownloadRequest,
  DocumentVersion,
  Paginated,
} from '@/shared/types/api'
import type {
  DocumentListParams,
  DocumentPayload,
  DownloadDecisionPayload,
  DownloadRequestListParams,
} from './types'

export async function fetchDocuments(
  params: DocumentListParams,
  signal?: AbortSignal,
): Promise<Paginated<Document>> {
  const { data } = await apiClient.get<Paginated<Document>>('/ddm/documents', {
    params,
    signal,
  })

  return data
}

export async function fetchDocument(
  documentId: number,
  signal?: AbortSignal,
): Promise<Document> {
  const { data } = await apiClient.get<{ data: Document }>(
    `/ddm/documents/${documentId}`,
    { signal },
  )

  return data.data
}

/**
 * The /ddm/categories endpoint is already scoped to DDM categories.
 */
export async function fetchDocumentCategories(
  signal?: AbortSignal,
): Promise<Paginated<DocumentCategory>> {
  const { data } = await apiClient.get<Paginated<DocumentCategory>>(
    '/ddm/categories',
    { params: { per_page: 100, is_active: 1 }, signal },
  )

  return data
}

function appendIfPresent(form: FormData, key: string, value: string | null): void {
  if (value !== null && value.trim() !== '') {
    form.append(key, value)
  }
}

export async function createDocument(
  payload: DocumentPayload,
  file: File,
): Promise<Document> {
  const form = new FormData()
  form.append('category_id', String(payload.category_id))
  form.append('title', payload.title)
  appendIfPresent(form, 'reference_no', payload.reference_no)
  appendIfPresent(form, 'document_date', payload.document_date)
  appendIfPresent(form, 'description', payload.description)
  appendIfPresent(form, 'remarks', payload.remarks)
  appendIfPresent(form, 'access_level', payload.access_level)
  form.append('file', file)

  const { data } = await apiClient.post<{ data: Document }>('/ddm/documents', form)

  return data.data
}

export async function updateDocument(
  documentId: number,
  payload: DocumentPayload,
): Promise<Document> {
  const { data } = await apiClient.put<{ data: Document }>(
    `/ddm/documents/${documentId}`,
    payload,
  )

  return data.data
}

export async function addDocumentVersion(
  documentId: number,
  file: File,
  changeNote: string | null,
): Promise<DocumentVersion> {
  const form = new FormData()
  form.append('file', file)
  appendIfPresent(form, 'change_note', changeNote)

  const { data } = await apiClient.post<{ data: DocumentVersion }>(
    `/ddm/documents/${documentId}/versions`,
    form,
  )

  return data.data
}

export async function archiveDocument(documentId: number): Promise<Document> {
  const { data } = await apiClient.post<{ data: Document }>(
    `/ddm/documents/${documentId}/archive`,
  )

  return data.data
}

export async function unarchiveDocument(documentId: number): Promise<Document> {
  const { data } = await apiClient.post<{ data: Document }>(
    `/ddm/documents/${documentId}/unarchive`,
  )

  return data.data
}

export async function deleteDocument(
  documentId: number,
  reason: string,
): Promise<void> {
  await apiClient.delete(`/ddm/documents/${documentId}`, { data: { reason } })
}

function filenameFromDisposition(disposition: unknown): string | null {
  if (typeof disposition !== 'string') {
    return null
  }

  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(disposition)

  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1])
    } catch {
      return utf8[1]
    }
  }

  const quoted = /filename="?([^";]+)"?/i.exec(disposition)

  return quoted?.[1] ?? null
}

/**
 * Streams an authorized download. The API returns 403
 * `download_approval_required` when an approved request is needed.
 */
export async function downloadDocument(
  documentId: number,
  fallbackName: string,
): Promise<void> {
  const response = await apiClient.get<Blob>(
    `/ddm/documents/${documentId}/download`,
    { responseType: 'blob' },
  )
  const filename =
    filenameFromDisposition(response.headers['content-disposition']) ??
    fallbackName
  const url = URL.createObjectURL(response.data)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function createDownloadRequest(
  documentId: number,
  reason: string,
): Promise<DocumentDownloadRequest> {
  const { data } = await apiClient.post<{ data: DocumentDownloadRequest }>(
    `/ddm/documents/${documentId}/download-requests`,
    { reason },
  )

  return data.data
}

export async function fetchDownloadRequests(
  params: DownloadRequestListParams,
  signal?: AbortSignal,
): Promise<Paginated<DocumentDownloadRequest>> {
  const { data } = await apiClient.get<Paginated<DocumentDownloadRequest>>(
    '/ddm/download-requests',
    { params, signal },
  )

  return data
}

export async function approveDownloadRequest(
  requestId: number,
  payload: DownloadDecisionPayload,
): Promise<DocumentDownloadRequest> {
  const { data } = await apiClient.post<{ data: DocumentDownloadRequest }>(
    `/ddm/download-requests/${requestId}/approve`,
    payload,
  )

  return data.data
}

export async function denyDownloadRequest(
  requestId: number,
  payload: DownloadDecisionPayload,
): Promise<DocumentDownloadRequest> {
  const { data } = await apiClient.post<{ data: DocumentDownloadRequest }>(
    `/ddm/download-requests/${requestId}/deny`,
    payload,
  )

  return data.data
}
