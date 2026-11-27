import type { DocumentListParams, DownloadRequestListParams } from './types'

export const documentKeys = {
  all: ['ddm', 'documents'] as const,
  list: (params: DocumentListParams) =>
    [...documentKeys.all, 'list', params] as const,
  detail: (documentId: number) =>
    [...documentKeys.all, 'detail', documentId] as const,
  categories: () => ['ddm', 'categories'] as const,
  downloadRequests: (params: DownloadRequestListParams) =>
    ['ddm', 'download-requests', params] as const,
}
