import { useQuery } from '@tanstack/react-query'
import { fetchProjectUpdates } from '../api'
import { projectKeys } from '../queryKeys'

export function useProjectUpdates(projectId: number, page: number) {
  return useQuery({
    queryKey: projectKeys.updates(projectId, page),
    queryFn: ({ signal }) => fetchProjectUpdates(projectId, page, signal),
    enabled: Number.isInteger(projectId) && projectId > 0,
    staleTime: 30_000,
  })
}
