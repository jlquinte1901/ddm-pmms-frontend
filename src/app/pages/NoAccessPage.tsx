import { LockKeyhole } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/states'

export function NoAccessPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="No module access yet"
        description="Your account is active, but no module has been granted to it."
      />
      <EmptyState
        icon={<LockKeyhole />}
        title="Ask for access"
        description="A Super Admin can grant you DDM access, PMMS access, or both. Once you have access, your navigation will update the next time you sign in."
      />
    </div>
  )
}
