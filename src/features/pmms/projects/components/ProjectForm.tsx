import { useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AlertCircle, Save } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from 'cn'
import type { ProjectCategory } from '@/shared/types/api'
import {
  currentImplementationYear,
  projectSchema,
  type ProjectFormValues,
} from '../schemas/projectSchema'
import { applyServerErrors } from './formErrors'

const selectClassName =
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30'

const CREATE_DEFAULTS: ProjectFormValues = {
  project_category_id: '',
  implementation_year: currentImplementationYear(),
  project_name: '',
  contract_number: '',
  location: '',
  region: '',
  lgu: '',
  department: '',
  implementing_office: '',
  project_manager: '',
  fund_source: '',
  contract_amount: '',
  revised_amount: '',
  planned_start_date: '',
  planned_finish_date: '',
  actual_start_date: '',
  actual_finish_date: '',
  contractor: '',
  remarks: '',
}

type FormFieldProps = {
  id: keyof ProjectFormValues
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: ReactNode
}

function FormField({
  id,
  label,
  error,
  hint,
  required = false,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center gap-1">
        <Label htmlFor={id}>{label}</Label>
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border bg-card p-4 sm:p-5">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

type ProjectFormProps = {
  categories: ProjectCategory[]
  mode?: 'create' | 'edit'
  initialValues?: ProjectFormValues
  submitLabel?: string
  isSubmitting?: boolean
  onSubmit: (values: ProjectFormValues) => Promise<void>
  onCancel: () => void
}

export function ProjectForm({
  categories,
  mode = 'create',
  initialValues,
  submitLabel,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialValues ?? CREATE_DEFAULTS,
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError(null)

    try {
      await onSubmit(values)
    } catch (error) {
      applyServerErrors(form.setError, error, setServerError)
    }
  })

  function fieldError(name: keyof ProjectFormValues): string | undefined {
    return form.formState.errors[name]?.message
  }

  function fieldProps(name: keyof ProjectFormValues) {
    const error = fieldError(name)

    return {
      'aria-invalid': error !== undefined,
      'aria-describedby': error ? `${name}-error` : undefined,
    } as const
  }

  const submitting = isSubmitting || form.formState.isSubmitting
  const submitText = submitting
    ? 'Saving\u2026'
    : (submitLabel ?? (mode === 'edit' ? 'Save changes' : 'Register project'))

  return (
    <form noValidate onSubmit={submit} className="space-y-5">
      {serverError ? (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>{serverError}</AlertTitle>
        </Alert>
      ) : null}

      <FormSection
        title="Project identification"
        description="The identifying details printed on the approved project form."
      >
        <FormField
          id="project_category_id"
          label="Project category"
          required
          error={fieldError('project_category_id')}
        >
          <select
            id="project_category_id"
            className={selectClassName}
            {...fieldProps('project_category_id')}
            {...form.register('project_category_id')}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          id="implementation_year"
          label="Implementation year"
          required
          error={fieldError('implementation_year')}
        >
          <Input
            id="implementation_year"
            type="number"
            inputMode="numeric"
            min={1900}
            max={2100}
            {...fieldProps('implementation_year')}
            {...form.register('implementation_year')}
          />
        </FormField>

        <FormField
          id="project_name"
          label="Project name"
          required
          className="sm:col-span-2"
          error={fieldError('project_name')}
        >
          <Input
            id="project_name"
            autoComplete="off"
            {...fieldProps('project_name')}
            {...form.register('project_name')}
          />
        </FormField>

        <FormField
          id="contract_number"
          label="Contract number"
          hint="Optional. The backend rejects duplicates."
          error={fieldError('contract_number')}
        >
          <Input
            id="contract_number"
            autoComplete="off"
            {...fieldProps('contract_number')}
            {...form.register('contract_number')}
          />
        </FormField>

        <FormField
          id="fund_source"
          label="Fund source"
          required
          error={fieldError('fund_source')}
        >
          <Input
            id="fund_source"
            autoComplete="off"
            {...fieldProps('fund_source')}
            {...form.register('fund_source')}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Location and organization"
        description="Where the project is implemented and who is accountable for it."
      >
        <FormField
          id="location"
          label="Location"
          required
          className="sm:col-span-2"
          error={fieldError('location')}
        >
          <Input
            id="location"
            autoComplete="off"
            {...fieldProps('location')}
            {...form.register('location')}
          />
        </FormField>

        <FormField id="region" label="Region" error={fieldError('region')}>
          <Input
            id="region"
            autoComplete="off"
            {...fieldProps('region')}
            {...form.register('region')}
          />
        </FormField>

        <FormField id="lgu" label="LGU" error={fieldError('lgu')}>
          <Input
            id="lgu"
            autoComplete="off"
            {...fieldProps('lgu')}
            {...form.register('lgu')}
          />
        </FormField>

        <FormField
          id="department"
          label="Department"
          error={fieldError('department')}
        >
          <Input
            id="department"
            autoComplete="off"
            {...fieldProps('department')}
            {...form.register('department')}
          />
        </FormField>

        <FormField
          id="implementing_office"
          label="Implementing office"
          error={fieldError('implementing_office')}
        >
          <Input
            id="implementing_office"
            autoComplete="off"
            {...fieldProps('implementing_office')}
            {...form.register('implementing_office')}
          />
        </FormField>

        <FormField
          id="project_manager"
          label="Project manager"
          hint="Display text from the paper form. Not used for authorization."
          error={fieldError('project_manager')}
        >
          <Input
            id="project_manager"
            autoComplete="off"
            {...fieldProps('project_manager')}
            {...form.register('project_manager')}
          />
        </FormField>

        <FormField
          id="contractor"
          label="Contractor"
          error={fieldError('contractor')}
        >
          <Input
            id="contractor"
            autoComplete="off"
            {...fieldProps('contractor')}
            {...form.register('contractor')}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Financials"
        description="Amounts are recorded as decimal values, never calculated in the browser."
      >
        <FormField
          id="contract_amount"
          label="Contract amount"
          required
          error={fieldError('contract_amount')}
        >
          <Input
            id="contract_amount"
            inputMode="decimal"
            placeholder="0.00"
            {...fieldProps('contract_amount')}
            {...form.register('contract_amount')}
          />
        </FormField>

        <FormField
          id="revised_amount"
          label="Revised amount"
          hint="Optional."
          error={fieldError('revised_amount')}
        >
          <Input
            id="revised_amount"
            inputMode="decimal"
            placeholder="0.00"
            {...fieldProps('revised_amount')}
            {...form.register('revised_amount')}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Schedule"
        description="The planned finish date must not be before the planned start date."
      >
        <FormField
          id="planned_start_date"
          label="Planned start date"
          required
          error={fieldError('planned_start_date')}
        >
          <Input
            id="planned_start_date"
            type="date"
            {...fieldProps('planned_start_date')}
            {...form.register('planned_start_date')}
          />
        </FormField>

        <FormField
          id="planned_finish_date"
          label="Planned finish date"
          required
          error={fieldError('planned_finish_date')}
        >
          <Input
            id="planned_finish_date"
            type="date"
            {...fieldProps('planned_finish_date')}
            {...form.register('planned_finish_date')}
          />
        </FormField>

        {mode === 'edit' ? (
          <>
            <FormField
              id="actual_start_date"
              label="Actual start date"
              hint="Optional. Informational only."
              error={fieldError('actual_start_date')}
            >
              <Input
                id="actual_start_date"
                type="date"
                {...fieldProps('actual_start_date')}
                {...form.register('actual_start_date')}
              />
            </FormField>

            <FormField
              id="actual_finish_date"
              label="Actual finish date"
              hint="Optional. Informational only."
              error={fieldError('actual_finish_date')}
            >
              <Input
                id="actual_finish_date"
                type="date"
                {...fieldProps('actual_finish_date')}
                {...form.register('actual_finish_date')}
              />
            </FormField>
          </>
        ) : null}
      </FormSection>

      <FormSection title="Remarks">
        <FormField
          id="remarks"
          label="Remarks"
          className="sm:col-span-2"
          hint="Optional context for delays, postponement, suspension, or termination."
          error={fieldError('remarks')}
        >
          <Textarea
            id="remarks"
            rows={4}
            {...fieldProps('remarks')}
            {...form.register('remarks')}
          />
        </FormField>
      </FormSection>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={submitting}>
          <Save aria-hidden="true" />
          {submitText}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
