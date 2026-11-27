import { useQuery } from '@tanstack/react-query'
import { fetchDocument } from '../api'
import { documentKeys } from '../queryKeys'

export function useDocument(documentId: number) {
  return useQuery({
    queryKey: documentKeys.detail(documentId),
    queryFn: ({ signal }) => fetchDocument(documentId, signal),
    enabled: Number.isInteger(documentId) && documentId > 0,
    staleTime: 30_000,
  })
}
