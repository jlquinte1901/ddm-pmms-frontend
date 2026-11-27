import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '../api'
import { categoryKeys } from '../queryKeys'
import type { CategoryListParams } from '../types'

export function useCategories(params: CategoryListParams) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: ({ signal }) => fetchCategories(params, signal),
    staleTime: 30_000,
  })
}
