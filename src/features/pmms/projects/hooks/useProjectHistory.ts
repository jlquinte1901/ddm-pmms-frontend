import { useQuery } from '@tanstack/react-query'
import { fetchProjectHistory } from '../api'
import { projectKeys } from '../queryKeys'

export function useProjectHistory(projectId: number, page: number) {
  return useQuery({
    queryKey: projectKeys.history(projectId, page),
    queryFn: ({ signal }) => fetchProjectHistory(projectId, page, signal),
    enabled: Number.isInteger(projectId) && projectId > 0,
    staleTime: 30_000,
  })
}
