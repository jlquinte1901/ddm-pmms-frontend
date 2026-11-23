import { apiClient } from '@/shared/api/client'
import type { DashboardResponse } from './types'

export async function fetchDashboard(
  signal?: AbortSignal,
): Promise<DashboardResponse> {
  const { data } = await apiClient.get<DashboardResponse>('/pmms/dashboard', {
    signal,
  })

  return data
}
