import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProject } from '../api'
import type { ProjectUpdatePayload } from '../types'

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: number
      payload: ProjectUpdatePayload
    }) => updateProject(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pmms'] })
    },
  })
}
