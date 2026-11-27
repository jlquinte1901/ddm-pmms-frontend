import { useQuery } from '@tanstack/react-query'
import { fetchDocuments } from '../api'
import { documentKeys } from '../queryKeys'
import type { DocumentListParams } from '../types'

export function useDocuments(params: DocumentListParams) {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: ({ signal }) => fetchDocuments(params, signal),
    staleTime: 30_000,
  })
}
