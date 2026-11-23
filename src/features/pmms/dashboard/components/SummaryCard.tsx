type SummaryCardProps = {
  label: string
  value: string
  hint?: string
}

export function SummaryCard({ label, value, hint }: SummaryCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
