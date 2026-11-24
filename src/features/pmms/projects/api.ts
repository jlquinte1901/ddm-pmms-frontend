import { apiClient } from '@/shared/api/client'
import type {
  Paginated,
  Project,
  ProjectCategory,
} from '@/shared/types/api'
import type {
  ProjectHistoryEntry,
  ProjectListParams,
  ProjectPayload,
  ProjectUpdateEntry,
} from './types'

export async function fetchProjects(
  params: ProjectListParams,
  signal?: AbortSignal,
): Promise<Paginated<Project>> {
  const { data } = await apiClient.get<Paginated<Project>>('/pmms/projects', {
    params,
    signal,
  })

  return data
}

/**
 * Active categories are used only to populate the category filter. The
 * backend still decides the actual project scope.
 */
export async function fetchProjectCategories(
  signal?: AbortSignal,
): Promise<Paginated<ProjectCategory>> {
  const { data } = await apiClient.get<Paginated<ProjectCategory>>(
    '/pmms/categories',
    {
      params: { per_page: 100, is_active: 1 },
      signal,
    },
  )

  return data
}

export async function fetchProject(
  projectId: number,
  signal?: AbortSignal,
): Promise<Project> {
  const { data } = await apiClient.get<{ data: Project }>(
    `/pmms/projects/${projectId}`,
    { signal },
  )

  return data.data
}

export async function createProject(
  payload: ProjectPayload,
): Promise<Project> {
  const { data } = await apiClient.post<{ data: Project }>(
    '/pmms/projects',
    payload,
  )

  return data.data
}

export async function fetchProjectHistory(
  projectId: number,
  page: number,
  signal?: AbortSignal,
): Promise<Paginated<ProjectHistoryEntry>> {
  const { data } = await apiClient.get<Paginated<ProjectHistoryEntry>>(
    `/pmms/projects/${projectId}/history`,
    { params: { page, per_page: 10 }, signal },
  )

  return data
}

export async function fetchProjectUpdates(
  projectId: number,
  page: number,
  signal?: AbortSignal,
): Promise<Paginated<ProjectUpdateEntry>> {
  const { data } = await apiClient.get<Paginated<ProjectUpdateEntry>>(
    `/pmms/projects/${projectId}/updates`,
    { params: { page, per_page: 10 }, signal },
  )

  return data
}
