import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from 'cn'

type ActionFieldProps = {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: ReactNode
}

export function ActionField({
  id,
  label,
  error,
  hint,
  required = false,
  className,
  children,
}: ActionFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center gap-1">
        <Label htmlFor={id}>{label}</Label>
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
