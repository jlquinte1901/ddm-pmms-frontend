import type { ProjectListParams } from './types'

export const projectKeys = {
  all: ['pmms', 'projects'] as const,
  list: (params: ProjectListParams) =>
    [...projectKeys.all, 'list', params] as const,
  categories: () => [...projectKeys.all, 'categories'] as const,
  detail: (projectId: number) =>
    [...projectKeys.all, 'detail', projectId] as const,
  history: (projectId: number, page: number) =>
    [...projectKeys.all, 'history', projectId, page] as const,
  updates: (projectId: number, page: number) =>
    [...projectKeys.all, 'updates', projectId, page] as const,
}
