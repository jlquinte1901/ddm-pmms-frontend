import type { ReactNode } from 'react'
import { cn } from 'cn'

export type StateTone = 'neutral' | 'danger' | 'warning'

type StateLayoutProps = {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
  tone?: StateTone
  className?: string
}

const toneClasses: Record<StateTone, string> = {
  neutral: 'text-muted-foreground',
  danger: 'text-destructive',
  warning: 'text-warning-text',
}

export function StateLayout({
  icon,
  title,
  description,
  action,
  tone = 'neutral',
  className,
}: StateLayoutProps) {
  return (
    <div
      className={cn(
        'flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card px-6 py-12 text-center',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          'flex size-11 items-center justify-center rounded-full bg-muted [&_svg]:size-5',
          toneClasses[tone],
        )}
      >
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {description ? (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
