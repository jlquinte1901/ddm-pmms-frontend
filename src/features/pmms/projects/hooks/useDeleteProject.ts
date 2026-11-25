import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteProject } from '../api'
import type { DeleteProjectPayload } from '../types'

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: number
      payload: DeleteProjectPayload
    }) => deleteProject(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pmms'] })
    },
  })
}
