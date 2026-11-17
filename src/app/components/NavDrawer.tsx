import { NavLink } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { cn } from 'cn'
import type { AppNavItem } from '../navigation'

export function NavDrawer({
  items,
  onNavigate,
}: {
  items: readonly AppNavItem[]
  onNavigate: () => void
}) {
  return (
    <nav aria-label="All modules" className="flex flex-col gap-1 p-2">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-muted',
            )
          }
        >
          <Building2 aria-hidden="true" className="size-4 opacity-70" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
