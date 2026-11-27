import type { AccessLevel, DocumentState } from '@/shared/types/api'

export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  restricted: 'Restricted',
  confidential: 'Confidential',
}

export const ACCESS_LEVEL_BADGE_CLASS: Record<AccessLevel, string> = {
  restricted: 'bg-amber-100 text-amber-900',
  confidential: 'bg-rose-100 text-rose-900',
}

export const DOCUMENT_STATE_LABELS: Record<DocumentState, string> = {
  active: 'Active',
  archived: 'Archived',
  deleted: 'Deleted',
}

export const DOCUMENT_STATE_BADGE_CLASS: Record<DocumentState, string> = {
  active: 'bg-emerald-100 text-emerald-900',
  archived: 'bg-slate-200 text-slate-800',
  deleted: 'bg-red-100 text-red-900',
}
