import { apiClient } from '@/shared/api/client'
import type {
  Paginated,
  Project,
  ProjectCategory,
  UserSummary,
} from '@/shared/types/api'
import type {
  CorrectPlannedDatesPayload,
  DeleteProjectPayload,
  PauseProjectPayload,
  ProgressReportPayload,
  ProjectHistoryEntry,
  ProjectListParams,
  ProjectPayload,
  ProjectUpdateEntry,
  ProjectUpdatePayload,
  ReassignProjectPayload,
  ReopenProjectPayload,
  ResumeProjectPayload,
  StartProjectPayload,
  TerminateProjectPayload,
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

export async function updateProject(
  projectId: number,
  payload: ProjectUpdatePayload,
): Promise<Project> {
  const { data } = await apiClient.put<{ data: Project }>(
    `/pmms/projects/${projectId}`,
    payload,
  )

  return data.data
}

export async function startProject(
  projectId: number,
  payload: StartProjectPayload,
): Promise<Project> {
  const { data } = await apiClient.post<{ data: Project }>(
    `/pmms/projects/${projectId}/start`,
    payload,
  )

  return data.data
}

export async function reportProjectProgress(
  projectId: number,
  payload: ProgressReportPayload,
): Promise<Project> {
  const { data } = await apiClient.post<{ data: Project }>(
    `/pmms/projects/${projectId}/progress`,
    payload,
  )

  return data.data
}

export async function pauseProject(
  projectId: number,
  payload: PauseProjectPayload,
): Promise<Project> {
  const { data } = await apiClient.post<{ data: Project }>(
    `/pmms/projects/${projectId}/pause`,
    payload,
  )

  return data.data
}

export async function resumeProject(
  projectId: number,
  payload: ResumeProjectPayload,
): Promise<Project> {
  const { data } = await apiClient.post<{ data: Project }>(
    `/pmms/projects/${projectId}/resume`,
    payload,
  )

  return data.data
}

export async function terminateProject(
  projectId: number,
  payload: TerminateProjectPayload,
): Promise<Project> {
  const { data } = await apiClient.post<{ data: Project }>(
    `/pmms/projects/${projectId}/terminate`,
    payload,
  )

  return data.data
}

export async function reopenProject(
  projectId: number,
  payload: ReopenProjectPayload,
): Promise<Project> {
  const { data } = await apiClient.post<{ data: Project }>(
    `/pmms/projects/${projectId}/reopen`,
    payload,
  )

  return data.data
}

export async function reassignProject(
  projectId: number,
  payload: ReassignProjectPayload,
): Promise<Project> {
  const { data } = await apiClient.post<{ data: Project }>(
    `/pmms/projects/${projectId}/reassign`,
    payload,
  )

  return data.data
}

export async function deleteProject(
  projectId: number,
  payload: DeleteProjectPayload,
): Promise<void> {
  await apiClient.delete(`/pmms/projects/${projectId}`, { data: payload })
}

export async function correctPlannedDates(
  projectId: number,
  payload: CorrectPlannedDatesPayload,
): Promise<Project> {
  const { data } = await apiClient.post<{ data: Project }>(
    `/pmms/projects/${projectId}/correct-planned-dates`,
    payload,
  )

  return data.data
}

export async function fetchAssignableEngineers(
  signal?: AbortSignal,
): Promise<UserSummary[]> {
  const { data } = await apiClient.get<{ data: UserSummary[] }>(
    '/pmms/assignable-engineers',
    { signal },
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
