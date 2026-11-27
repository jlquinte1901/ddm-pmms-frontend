import type { AccessLevel, DocumentState } from '@/shared/types/api'

export type DocumentListParams = {
  q?: string
  category_id?: number
  access_level?: AccessLevel
  state?: DocumentState | 'all'
  date_from?: string
  date_to?: string
  page?: number
  per_page?: number
}

export type DocumentPayload = {
  category_id: number
  title: string
  reference_no: string | null
  document_date: string | null
  description: string | null
  remarks: string | null
  access_level: AccessLevel | null
}

export type DownloadRequestListParams = {
  status?: string
  document_id?: number
  page?: number
  per_page?: number
}

export type DownloadDecisionPayload = {
  decision_note?: string | null
  approval_days?: number | null
}
