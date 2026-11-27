import { apiClient } from '@/shared/api/client'
import type { DocumentCategory, Paginated } from '@/shared/types/api'
import type { CategoryListParams, CategoryPayload } from './types'

export async function fetchCategories(
  params: CategoryListParams,
  signal?: AbortSignal,
): Promise<Paginated<DocumentCategory>> {
  const { data } = await apiClient.get<Paginated<DocumentCategory>>(
    '/ddm/categories',
    { params, signal },
  )

  return data
}

export async function createCategory(
  payload: CategoryPayload,
): Promise<DocumentCategory> {
  const { data } = await apiClient.post<{ data: DocumentCategory }>(
    '/ddm/categories',
    payload,
  )

  return data.data
}

export async function updateCategory(
  categoryId: number,
  payload: CategoryPayload,
): Promise<DocumentCategory> {
  const { data } = await apiClient.patch<{ data: DocumentCategory }>(
    `/ddm/categories/${categoryId}`,
    payload,
  )

  return data.data
}
