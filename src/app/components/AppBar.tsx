import {
  Building2,
  ChevronDown,
  LogOut,
  Menu,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogoutMutation } from '@/features/auth/hooks/useLogoutMutation'
import type { AuthUser } from '@/shared/types/api'

type AppBarProps = {
  user: AuthUser | undefined
  onOpenNav: () => void
}

export function AppBar({ user, onOpenNav }: AppBarProps) {
  const logout = useLogoutMutation()
  const roleLabel = user?.role?.label ?? 'Signed in'

  return (
    <header className="bg-brand text-white">
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-3 px-3 py-3 md:px-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open navigation menu"
          className="text-white hover:bg-white/15 hover:text-white focus-visible:ring-white/70"
          onClick={onOpenNav}
        >
          <Menu aria-hidden="true" />
        </Button>

        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15">
            <Building2 aria-hidden="true" className="size-5" />
          </span>
          <p className="truncate text-xl font-bold tracking-tight md:text-2xl">
            City Engineering Department
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="max-w-[15rem] border-transparent bg-white text-foreground hover:bg-white/90 hover:text-foreground"
              >
                <UserRound aria-hidden="true" />
                <span className="hidden min-w-0 flex-col items-start text-left sm:flex">
                  <span className="w-full truncate text-sm font-medium">
                    {user?.full_name ?? 'Loading\u2026'}
                  </span>
                  <span className="w-full truncate text-xs text-muted-foreground">
                    {roleLabel}
                  </span>
                </span>
                <ChevronDown aria-hidden="true" className="opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="space-y-0.5">
                <span className="block text-sm font-medium">
                  {user?.full_name ?? 'Signed in'}
                </span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {user?.email ?? ''}
                </span>
                <span className="block text-xs font-normal text-muted-foreground">
                  {roleLabel}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={logout.isPending}
                onSelect={() => logout.mutate()}
              >
                <LogOut aria-hidden="true" />
                {logout.isPending ? 'Signing out\u2026' : 'Sign out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
