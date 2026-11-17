import type { ReactNode } from 'react'
import { LockKeyhole } from 'lucide-react'
import { StateLayout } from './StateLayout'

type ForbiddenStateProps = {
  title?: string
  description?: string
  action?: ReactNode
}

export function ForbiddenState({
  title = 'You do not have access',
  description = 'Your account does not have permission to open this screen. Contact the Data Management Section if you believe this is a mistake.',
  action,
}: ForbiddenStateProps) {
  return (
    <StateLayout
      icon={<LockKeyhole />}
      title={title}
      description={description}
      action={action}
      tone="warning"
    />
  )
}
