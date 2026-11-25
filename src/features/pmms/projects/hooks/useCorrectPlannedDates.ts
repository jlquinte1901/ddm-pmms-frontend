import { useMutation, useQueryClient } from '@tanstack/react-query'
import { correctPlannedDates } from '../api'
import type { CorrectPlannedDatesPayload } from '../types'

export function useCorrectPlannedDates() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: number
      payload: CorrectPlannedDatesPayload
    }) => correctPlannedDates(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pmms'] })
    },
  })
}
