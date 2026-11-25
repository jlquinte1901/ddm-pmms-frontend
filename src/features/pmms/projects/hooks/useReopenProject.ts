import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reopenProject } from '../api'
import type { ReopenProjectPayload } from '../types'

export function useReopenProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: number
      payload: ReopenProjectPayload
    }) => reopenProject(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pmms'] })
    },
  })
}
