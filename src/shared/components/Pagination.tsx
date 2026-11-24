import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PaginationProps = {
  page: number
  lastPage: number
  total: number
  from: number | null
  to: number | null
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  lastPage,
  total,
  from,
  to,
  onPageChange,
}: PaginationProps) {
  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {total === 0
          ? 'No results'
          : `Showing ${from ?? 0}\u2013${to ?? 0} of ${total}`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft aria-hidden="true" />
          Previous
        </Button>
        <p className="text-sm text-muted-foreground">
          Page {page} of {Math.max(lastPage, 1)}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= lastPage}
        >
          Next
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}
