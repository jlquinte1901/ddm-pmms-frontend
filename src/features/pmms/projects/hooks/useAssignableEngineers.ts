import { useQuery } from '@tanstack/react-query'
import { fetchAssignableEngineers } from '../api'
import { projectKeys } from '../queryKeys'

export function useAssignableEngineers(enabled = true) {
  return useQuery({
    queryKey: projectKeys.assignableEngineers(),
    queryFn: ({ signal }) => fetchAssignableEngineers(signal),
    enabled,
    staleTime: 60_000,
  })
}
