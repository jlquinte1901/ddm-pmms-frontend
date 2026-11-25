import { useMutation, useQueryClient } from '@tanstack/react-query'
import { resumeProject } from '../api'
import type { ResumeProjectPayload } from '../types'

export function useResumeProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: number
      payload: ResumeProjectPayload
    }) => resumeProject(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pmms'] })
    },
  })
}
