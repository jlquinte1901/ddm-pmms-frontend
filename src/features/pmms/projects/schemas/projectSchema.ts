import { z } from 'zod'
import type { Project } from '@/shared/types/api'
import type { ProjectPayload, ProjectUpdatePayload } from '../types'

function requiredText(label: string, max: number) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`)
}

function optionalText(label: string, max: number) {
  return z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer.`)
}

function optionalDate(label: string) {
  return z.string().trim().refine((value) => {
    if (value === '') {
      return true
    }

    return /^\d{4}-\d{2}-\d{2}$/.test(value)
  }, `${label} must be a valid date.`)
}

/**
 * Money is a decimal string end to end. Commas are accepted for convenience
 * and removed before the payload is sent.
 */
function money(label: string, required: boolean) {
  return z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value === '') {
        if (required) {
          ctx.addIssue({
            code: 'custom',
            message: `${label} is required.`,
          })
        }

        return
      }

      if (!/^\d+(\.\d{1,2})?$/.test(value.replace(/,/g, ''))) {
        ctx.addIssue({
          code: 'custom',
          message: `${label} must be an amount with up to two decimal places.`,
        })
      }
    })
}

const projectFields = {
  project_category_id: z.string().trim().min(1, 'Select a project category.'),
  implementation_year: z
    .string()
    .trim()
    .min(1, 'Implementation year is required.')
    .refine((value) => {
      const year = Number(value)

      return Number.isInteger(year) && year >= 1900 && year <= 2100
    }, 'Enter an implementation year between 1900 and 2100.'),
  project_name: requiredText('Project name', 255),
  contract_number: optionalText('Contract number', 100),
  location: requiredText('Location', 255),
  region: optionalText('Region', 100),
  lgu: optionalText('LGU', 100),
  department: optionalText('Department', 100),
  implementing_office: optionalText('Implementing office', 150),
  project_manager: optionalText('Project manager', 100),
  fund_source: requiredText('Fund source', 100),
  contract_amount: money('Contract amount', true),
  revised_amount: money('Revised amount', false),
  planned_start_date: z
    .string()
    .trim()
    .min(1, 'Planned start date is required.'),
  planned_finish_date: z
    .string()
    .trim()
    .min(1, 'Planned finish date is required.'),
  actual_start_date: optionalDate('Actual start date'),
  actual_finish_date: optionalDate('Actual finish date'),
  contractor: optionalText('Contractor', 150),
  remarks: optionalText('Remarks', 10000),
}

/**
 * Mirrors App\Http\Requests\StoreProjectRequest (create) and
 * UpdateProjectRequest (edit). Ownership, status, progress, and revised-finish
 * fields are deliberately absent; the backend sets them.
 */
export const projectSchema = z.object(projectFields).superRefine((values, ctx) => {
  if (
    values.planned_start_date !== '' &&
    values.planned_finish_date !== '' &&
    values.planned_finish_date < values.planned_start_date
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['planned_finish_date'],
      message: 'Planned finish date cannot be before the planned start date.',
    })
  }

  if (
    values.actual_start_date !== '' &&
    values.actual_finish_date !== '' &&
    values.actual_finish_date < values.actual_start_date
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['actual_finish_date'],
      message: 'Actual finish date cannot be before the actual start date.',
    })
  }
})

export type ProjectFormValues = z.infer<typeof projectSchema>

export function currentImplementationYear(): string {
  return String(new Date().getFullYear())
}

function nullable(value: string): string | null {
  const trimmed = value.trim()

  return trimmed === '' ? null : trimmed
}

function plainMoney(value: string): string {
  return value.replace(/,/g, '').trim()
}

export function toProjectPayload(values: ProjectFormValues): ProjectPayload {
  return {
    project_category_id: Number(values.project_category_id),
    implementation_year: Number(values.implementation_year),
    project_name: values.project_name.trim(),
    contract_number: nullable(values.contract_number),
    location: values.location.trim(),
    region: nullable(values.region),
    lgu: nullable(values.lgu),
    department: nullable(values.department),
    implementing_office: nullable(values.implementing_office),
    project_manager: nullable(values.project_manager),
    fund_source: values.fund_source.trim(),
    contract_amount: plainMoney(values.contract_amount),
    revised_amount: nullable(plainMoney(values.revised_amount)),
    planned_start_date: values.planned_start_date.trim(),
    planned_finish_date: values.planned_finish_date.trim(),
    contractor: nullable(values.contractor),
    remarks: nullable(values.remarks),
  }
}

export function toProjectUpdatePayload(
  values: ProjectFormValues,
): ProjectUpdatePayload {
  return {
    ...toProjectPayload(values),
    actual_start_date: nullable(values.actual_start_date),
    actual_finish_date: nullable(values.actual_finish_date),
  }
}

export function toProjectFormValues(project: Project): ProjectFormValues {
  return {
    project_category_id: String(project.project_category_id),
    implementation_year: String(project.implementation_year),
    project_name: project.project_name,
    contract_number: project.contract_number ?? '',
    location: project.location ?? '',
    region: project.region ?? '',
    lgu: project.lgu ?? '',
    department: project.department ?? '',
    implementing_office: project.implementing_office ?? '',
    project_manager: project.project_manager ?? '',
    fund_source: project.fund_source ?? '',
    contract_amount: project.contract_amount,
    revised_amount: project.revised_amount ?? '',
    planned_start_date: project.planned_start_date ?? '',
    planned_finish_date: project.planned_finish_date ?? '',
    actual_start_date: project.actual_start_date ?? '',
    actual_finish_date: project.actual_finish_date ?? '',
    contractor: project.contractor ?? '',
    remarks: project.remarks ?? '',
  }
}
