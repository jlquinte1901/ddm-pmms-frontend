import { AuthLayout } from '@/app/layouts/AuthLayout'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  return (
    <AuthLayout>
      <div className="space-y-4">
        <div className="space-y-1 text-center">
          <p className="text-sm font-medium text-primary">
            Data Management Section
          </p>
          <p className="text-sm text-muted-foreground">
            Document Management and Project Monitoring Management System
          </p>
        </div>
        <LoginForm />
      </div>
    </AuthLayout>
  )
}
