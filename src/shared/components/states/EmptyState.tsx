import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { StateLayout } from './StateLayout'

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <StateLayout
      icon={icon ?? <Inbox />}
      title={title}
      description={description}
      action={action}
    />
  )
}
