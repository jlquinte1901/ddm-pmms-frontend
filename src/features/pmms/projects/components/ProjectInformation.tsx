import {
  formatDate,
  formatDateTime,
  formatMoney,
} from '@/shared/lib/formatters'
import type { Project } from '@/shared/types/api'

const EMPTY = '\u2014'

function text(value: string | null | undefined): string {
  const trimmed = value?.trim()

  return trimmed ? trimmed : EMPTY
}

type InfoItem = {
  label: string
  value: string
}

function InfoSection({
  title,
  items,
}: {
  title: string
  items: InfoItem[]
}) {
  return (
    <section className="rounded-xl border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="space-y-0.5">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {item.label}
            </dt>
            <dd className="text-sm break-words text-foreground">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

type ProjectInformationProps = {
  project: Project
}

export function ProjectInformation({ project }: ProjectInformationProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <InfoSection
        title="Identification"
        items={[
          { label: 'Category', value: text(project.category?.name) },
          {
            label: 'Implementation year',
            value: String(project.implementation_year),
          },
          { label: 'Contract number', value: text(project.contract_number) },
          { label: 'Fund source', value: text(project.fund_source) },
          {
            label: 'Contract amount',
            value: formatMoney(project.contract_amount),
          },
          {
            label: 'Revised amount',
            value: project.revised_amount
              ? formatMoney(project.revised_amount)
              : EMPTY,
          },
        ]}
      />

      <InfoSection
        title="Location and organization"
        items={[
          { label: 'Location', value: text(project.location) },
          { label: 'Region', value: text(project.region) },
          { label: 'LGU', value: text(project.lgu) },
          { label: 'Department', value: text(project.department) },
          {
            label: 'Implementing office',
            value: text(project.implementing_office),
          },
          { label: 'Project manager', value: text(project.project_manager) },
          { label: 'Contractor', value: text(project.contractor) },
        ]}
      />

      <InfoSection
        title="Schedule"
        items={[
          {
            label: 'Planned start',
            value: formatDate(project.planned_start_date),
          },
          {
            label: 'Planned finish',
            value: formatDate(project.planned_finish_date),
          },
          {
            label: 'Revised finish',
            value: formatDate(project.revised_finish_date),
          },
          {
            label: 'Effective finish',
            value: formatDate(project.effective_finish_date),
          },
          {
            label: 'Actual start',
            value: formatDate(project.actual_start_date),
          },
          {
            label: 'Actual finish',
            value: formatDate(project.actual_finish_date),
          },
        ]}
      />

      <InfoSection
        title="Record"
        items={[
          {
            label: 'Assigned Project Engineer',
            value: text(project.assigned_pe?.full_name),
          },
          { label: 'Created by', value: text(project.creator?.full_name) },
          { label: 'Registered', value: formatDateTime(project.created_at) },
          { label: 'Last updated', value: formatDateTime(project.updated_at) },
          {
            label: 'Paused since',
            value: formatDate(project.paused_since),
          },
          {
            label: 'Completed at',
            value: formatDateTime(project.completed_at),
          },
        ]}
      />

      <section className="rounded-xl border bg-card p-4 lg:col-span-2">
        <h2 className="text-sm font-semibold text-foreground">Remarks</h2>
        <p className="mt-2 text-sm whitespace-pre-line text-foreground">
          {text(project.remarks)}
        </p>
      </section>
    </div>
  )
}
