import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useCurrentPermissions, useCurrentUser } from '@/shared/auth/useCurrentUser'
import { ErrorBoundary } from '../ErrorBoundary'
import { getVisibleNavItems } from '../navigation'
import { AppBar } from '../components/AppBar'
import { NavDrawer } from '../components/NavDrawer'
import { TabNav } from '../components/TabNav'

export function AppShell() {
  const [navOpen, setNavOpen] = useState(false)
  const { data: user } = useCurrentUser()
  const permissions = useCurrentPermissions()
  const navItems = getVisibleNavItems(permissions)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only rounded-md bg-card px-3 py-2 text-sm font-medium text-foreground shadow focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to main content
      </a>

      <AppBar user={user} onOpenNav={() => setNavOpen(true)} />
      <TabNav items={navItems} />

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-80 bg-card p-0">
          <SheetHeader className="border-b">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>
              Modules available to your account.
            </SheetDescription>
          </SheetHeader>
          <NavDrawer items={navItems} onNavigate={() => setNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-6"
      >
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
