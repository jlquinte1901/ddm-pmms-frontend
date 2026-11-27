import { useQuery } from '@tanstack/react-query'
import { fetchDownloadRequests } from '../api'
import { documentKeys } from '../queryKeys'
import type { DownloadRequestListParams } from '../types'

export function useDownloadRequests(params: DownloadRequestListParams) {
  return useQuery({
    queryKey: documentKeys.downloadRequests(params),
    queryFn: ({ signal }) => fetchDownloadRequests(params, signal),
    staleTime: 30_000,
  })
}
