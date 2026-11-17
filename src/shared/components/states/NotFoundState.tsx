import type { ReactNode } from 'react'
import { FileQuestion } from 'lucide-react'
import { StateLayout } from './StateLayout'

type NotFoundStateProps = {
  title?: string
  description?: string
  action?: ReactNode
}

export function NotFoundState({
  title = 'Not found',
  description = 'The page or record you are looking for does not exist, or it is no longer available to you.',
  action,
}: NotFoundStateProps) {
  return (
    <StateLayout
      icon={<FileQuestion />}
      title={title}
      description={description}
      action={action}
    />
  )
}
