import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  formatDate,
  formatDays,
  formatMoney,
  formatProgress,
} from '@/shared/lib/formatters'
import type { Project } from '@/shared/types/api'
import { getIndicatorMeta } from '../../shared/indicatorMeta'

function timeCard(project: Project): { value: string; hint: string } {
  if (project.indicator === 'paused') {
    const days = project.days_paused

    return {
      value:
        days === null
          ? '\u2014'
          : `${days} ${days === 1 ? 'day' : 'days'}`,
      hint: 'Days paused',
    }
  }

  if (project.indicator === 'completed' || project.indicator === 'terminated') {
    return {
      value: '\u2014',
      hint: project.status_label,
    }
  }

  return {
    value: formatDays(project.days_remaining),
    hint: `Deadline ${formatDate(project.effective_finish_date)}`,
  }
}

function StatCard({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 text-lg font-semibold tracking-tight text-foreground">
        {children}
      </div>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

type ProjectSummaryProps = {
  project: Project
}

export function ProjectSummary({ project }: ProjectSummaryProps) {
  const meta = getIndicatorMeta(project.indicator)
  const time = timeCard(project)

  return (
    <section
      aria-label="Project summary"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <StatCard label="Status">
        <Badge variant="outline">{project.status_label}</Badge>
      </StatCard>
      <StatCard label="Monitoring indicator" hint="Calculated by the server">
        <Badge className={meta.badgeClassName}>{project.indicator_label}</Badge>
      </StatCard>
      <StatCard label="Progress" hint="Latest reported progress">
        {formatProgress(project.progress_percentage)}
      </StatCard>
      <StatCard label="Time remaining" hint={time.hint}>
        {time.value}
      </StatCard>
      <StatCard label="Contract amount" hint="As recorded">
        {formatMoney(project.contract_amount)}
      </StatCard>
    </section>
  )
}
