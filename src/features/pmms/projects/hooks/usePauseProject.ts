import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pauseProject } from '../api'
import type { PauseProjectPayload } from '../types'

export function usePauseProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: number
      payload: PauseProjectPayload
    }) => pauseProject(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pmms'] })
    },
  })
}
