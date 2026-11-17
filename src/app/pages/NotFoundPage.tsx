import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { NotFoundState } from '@/shared/components/states'

export function NotFoundPage() {
  return (
    <NotFoundState
      action={
        <Button asChild variant="outline">
          <Link to="/">Go to your home page</Link>
        </Button>
      }
    />
  )
}
