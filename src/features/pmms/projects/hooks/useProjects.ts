import { useQuery } from '@tanstack/react-query'
import { fetchProjects } from '../api'
import { projectKeys } from '../queryKeys'
import type { ProjectListParams } from '../types'

export function useProjects(params: ProjectListParams) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: ({ signal }) => fetchProjects(params, signal),
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  })
}
