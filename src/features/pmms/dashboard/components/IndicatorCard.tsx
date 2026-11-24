import { Link } from 'react-router-dom'
import { cn } from 'cn'
import type { IndicatorMeta } from '../../shared/indicatorMeta'

type IndicatorCardProps = {
  meta: IndicatorMeta
  count: number
}

export function IndicatorCard({ meta, count }: IndicatorCardProps) {
  return (
    <Link
      to={`/pmms/projects?indicator=${meta.value}`}
      aria-label={`${meta.label}: ${count} ${count === 1 ? 'project' : 'projects'}`}
      className={cn(
        'flex flex-col gap-1 rounded-xl border p-4 transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        meta.cardClassName,
      )}
    >
      <span className="text-sm font-semibold">{meta.label}</span>
      <span className="text-3xl leading-none font-semibold tabular-nums">
        {count}
      </span>
      <span className="text-xs opacity-85">{meta.description}</span>
    </Link>
  )
}
