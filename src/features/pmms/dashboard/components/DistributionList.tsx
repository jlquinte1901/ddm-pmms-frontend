type DistributionItem = {
  label: string
  count: number
}

type DistributionListProps = {
  title: string
  items: DistributionItem[]
  emptyLabel: string
}

export function DistributionList({
  title,
  items,
  emptyLabel,
}: DistributionListProps) {
  const max = Math.max(...items.map((item) => item.count), 1)

  return (
    <section className="rounded-xl border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li key={item.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-foreground">{item.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {item.count}
                </span>
              </div>
              <div
                aria-hidden="true"
                className="mt-1 h-2 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
