import { useQuery } from '@tanstack/react-query'
import { fetchDocumentCategories } from '../api'
import { documentKeys } from '../queryKeys'

export function useDocumentCategories() {
  return useQuery({
    queryKey: documentKeys.categories(),
    queryFn: ({ signal }) => fetchDocumentCategories(signal),
    staleTime: 5 * 60_000,
  })
}
