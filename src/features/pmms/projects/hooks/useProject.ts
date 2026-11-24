import { useQuery } from '@tanstack/react-query'
import { fetchProject } from '../api'
import { projectKeys } from '../queryKeys'

export function useProject(projectId: number) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: ({ signal }) => fetchProject(projectId, signal),
    enabled: Number.isInteger(projectId) && projectId > 0,
    staleTime: 30_000,
  })
}
