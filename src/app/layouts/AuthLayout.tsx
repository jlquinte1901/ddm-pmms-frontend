import type { ReactNode } from 'react'
import loginBackground from '@/assets/image 3.png'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <img
        src={loginBackground}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/20 to-white/35"
      />
      <main className="relative w-full max-w-xl">{children}</main>
    </div>
  )
}
