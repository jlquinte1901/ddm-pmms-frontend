import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/states'

type PlaceholderPageProps = {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <EmptyState
        title="This screen is not built yet"
        description="Sign-in, session handling, permissions, and navigation are in place. The full screen arrives in its approved phase."
      />
    </div>
  )
}
