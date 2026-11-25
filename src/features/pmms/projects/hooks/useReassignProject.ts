import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reassignProject } from '../api'
import type { ReassignProjectPayload } from '../types'

export function useReassignProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: number
      payload: ReassignProjectPayload
    }) => reassignProject(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pmms'] })
    },
  })
}
