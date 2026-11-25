import { useMutation, useQueryClient } from '@tanstack/react-query'
import { startProject } from '../api'
import type { StartProjectPayload } from '../types'

export function useStartProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: number
      payload: StartProjectPayload
    }) => startProject(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pmms'] })
    },
  })
}
