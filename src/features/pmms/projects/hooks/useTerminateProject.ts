import { useMutation, useQueryClient } from '@tanstack/react-query'
import { terminateProject } from '../api'
import type { TerminateProjectPayload } from '../types'

export function useTerminateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: number
      payload: TerminateProjectPayload
    }) => terminateProject(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pmms'] })
    },
  })
}
