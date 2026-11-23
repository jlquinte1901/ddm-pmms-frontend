import cgbLogo from '@/assets/cgb-logo.png'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  return (
    <AuthLayout>
      <section className="rounded-2xl border border-white/60 bg-white/95 p-8 shadow-2xl backdrop-blur-sm sm:p-10">
        <header className="flex flex-col items-center gap-3 text-center">
          <img
            src={cgbLogo}
            alt="City Government of Butuan seal"
            className="size-24 object-contain"
          />
          <h1 className="text-balance text-xl leading-snug font-bold text-foreground sm:text-2xl">
            Digital-Based Document Management and Project-Based Monitoring
            Management System
          </h1>
          <p className="text-sm font-medium text-muted-foreground sm:text-base">
            City Engineering Department
          </p>
        </header>
        <div className="mt-8">
          <LoginForm />
        </div>
      </section>
    </AuthLayout>
  )
}
