import type { AccessLevel } from '@/shared/types/api'

export type CategoryListParams = {
  q?: string
  is_active?: number
  page?: number
  per_page?: number
}

export type CategoryPayload = {
  name: string
  default_access_level: AccessLevel
  is_active: boolean
}
