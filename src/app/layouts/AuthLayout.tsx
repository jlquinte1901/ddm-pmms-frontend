import type { ReactNode } from 'react'
import { Building2 } from 'lucide-react'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="bg-brand text-white">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4 md:px-6">
          <span className="flex size-10 items-center justify-center rounded-full bg-white/15">
            <Building2 aria-hidden="true" className="size-5" />
          </span>
          <p className="text-xl font-bold tracking-tight md:text-2xl">
            City Engineering Department
          </p>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="px-4 pb-6 text-center text-xs text-muted-foreground">
        DDM-PMMS &middot; Data Management Section
      </footer>
    </div>
  )
}
