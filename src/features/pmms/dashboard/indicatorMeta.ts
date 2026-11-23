import type { Indicator } from '@/shared/types/api'

export type IndicatorMeta = {
  value: Indicator
  label: string
  description: string
  cardClassName: string
  badgeClassName: string
}

/**
 * Labels and tokens mirror App\Enums\ProjectIndicator. The API is the source
 * of the count; nothing here recomputes the 35-day rule.
 */
export const INDICATOR_META: readonly IndicatorMeta[] = [
  {
    value: 'normal',
    label: 'Normal',
    description: 'More than 35 days remaining',
    cardClassName:
      'border-indicator-normal-bg bg-indicator-normal-bg text-indicator-normal-text',
    badgeClassName:
      'bg-indicator-normal-bg text-indicator-normal-text',
  },
  {
    value: 'critical',
    label: 'Critical',
    description: '0 to 35 days remaining',
    cardClassName:
      'border-indicator-critical-border bg-indicator-critical-bg text-indicator-critical-text',
    badgeClassName:
      'bg-indicator-critical-bg text-indicator-critical-text',
  },
  {
    value: 'overdue',
    label: 'Overdue',
    description: 'Past the effective finish date',
    cardClassName:
      'border-indicator-overdue-bg bg-indicator-overdue-bg text-indicator-overdue-text',
    badgeClassName:
      'bg-indicator-overdue-bg text-indicator-overdue-text',
  },
  {
    value: 'paused',
    label: 'Paused',
    description: 'Suspended or postponed',
    cardClassName:
      'border-indicator-paused-bg bg-indicator-paused-bg text-indicator-paused-text',
    badgeClassName:
      'bg-indicator-paused-bg text-indicator-paused-text',
  },
  {
    value: 'completed',
    label: 'Completed',
    description: 'Finished at 100% progress',
    cardClassName:
      'border-indicator-completed-bg bg-indicator-completed-bg text-indicator-completed-text',
    badgeClassName:
      'bg-indicator-completed-bg text-indicator-completed-text',
  },
  {
    value: 'terminated',
    label: 'Terminated',
    description: 'Closed through an admin action',
    cardClassName:
      'border-indicator-terminated-bg bg-indicator-terminated-bg text-indicator-terminated-text',
    badgeClassName:
      'bg-indicator-terminated-bg text-indicator-terminated-text',
  },
]

const INDICATOR_BY_VALUE = new Map<Indicator, IndicatorMeta>(
  INDICATOR_META.map((meta) => [meta.value, meta]),
)

export function getIndicatorMeta(value: Indicator): IndicatorMeta {
  return INDICATOR_BY_VALUE.get(value) ?? INDICATOR_META[0]
}
