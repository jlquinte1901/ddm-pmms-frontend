import { useQuery } from '@tanstack/react-query'
import { fetchProjectCategories } from '../api'
import { projectKeys } from '../queryKeys'

export function useProjectCategories() {
  return useQuery({
    queryKey: projectKeys.categories(),
    queryFn: ({ signal }) => fetchProjectCategories(signal),
    staleTime: 5 * 60_000,
  })
}
