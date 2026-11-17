import { NavLink } from 'react-router-dom'
import { cn } from 'cn'
import type { AppNavItem } from '../navigation'

export function TabNav({ items }: { items: readonly AppNavItem[] }) {
  if (items.length === 0) {
    return null
  }

  return (
    <nav aria-label="Modules" className="border-b bg-card">
      <div className="mx-auto flex w-full max-w-[1400px] gap-1 overflow-x-auto px-2 md:px-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'inline-flex shrink-0 items-center border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:border-border-strong hover:text-foreground',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
