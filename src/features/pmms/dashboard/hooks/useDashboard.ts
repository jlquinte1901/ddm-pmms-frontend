import { useQuery } from '@tanstack/react-query'
import { fetchDashboard } from '../api'
import { dashboardKeys } from '../queryKeys'

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: ({ signal }) => fetchDashboard(signal),
    staleTime: 60_000,
  })
}
