import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCategory, updateCategory } from '../api'
import type { CategoryPayload } from '../types'

function useInvalidateCategories() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: ['ddm'] })
  }
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories()

  return useMutation({
    mutationFn: (payload: CategoryPayload) => createCategory(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories()

  return useMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: number
      payload: CategoryPayload
    }) => updateCategory(categoryId, payload),
    onSuccess: invalidate,
  })
}
