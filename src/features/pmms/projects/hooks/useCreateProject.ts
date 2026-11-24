import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProject } from '../api'
import type { ProjectPayload } from '../types'

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ProjectPayload) => createProject(payload),
    onSuccess: () => {
      // Lists and the dashboard both live under the ["pmms"] prefix.
      void queryClient.invalidateQueries({ queryKey: ['pmms'] })
    },
  })
}
