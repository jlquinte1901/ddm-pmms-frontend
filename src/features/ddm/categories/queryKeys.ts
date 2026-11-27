import type { CategoryListParams } from './types'

export const categoryKeys = {
  all: ['ddm', 'categories'] as const,
  list: (params: CategoryListParams) =>
    [...categoryKeys.all, 'list', params] as const,
}
