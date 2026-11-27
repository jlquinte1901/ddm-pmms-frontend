import type { EffectiveRequestStatus } from '@/shared/types/api'

export const REQUEST_STATUS_LABELS: Record<EffectiveRequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  denied: 'Denied',
  cancelled: 'Cancelled',
  lapsed: 'Lapsed',
  expired: 'Expired',
}

export const REQUEST_STATUS_BADGE_CLASS: Record<
  EffectiveRequestStatus,
  string
> = {
  pending: 'bg-amber-100 text-amber-900',
  approved: 'bg-emerald-100 text-emerald-900',
  denied: 'bg-rose-100 text-rose-900',
  cancelled: 'bg-slate-200 text-slate-800',
  lapsed: 'bg-orange-100 text-orange-900',
  expired: 'bg-red-100 text-red-900',
}
