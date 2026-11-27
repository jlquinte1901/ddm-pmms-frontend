import { z } from 'zod'
import type { CategoryPayload } from '../types'

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .max(100, 'Name must be 100 characters or fewer.'),
  default_access_level: z.enum(['restricted', 'confidential']),
  is_active: z.boolean(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

export function toCategoryPayload(
  values: CategoryFormValues,
): CategoryPayload {
  return {
    name: values.name.trim(),
    default_access_level: values.default_access_level,
    is_active: values.is_active,
  }
}
