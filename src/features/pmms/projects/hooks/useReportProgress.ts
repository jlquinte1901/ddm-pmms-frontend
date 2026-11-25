import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reportProjectProgress } from '../api'
import type { ProgressReportPayload } from '../types'

export function useReportProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: number
      payload: ProgressReportPayload
    }) => reportProjectProgress(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pmms'] })
    },
  })
}
