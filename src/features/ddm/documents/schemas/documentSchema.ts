import { z } from 'zod'
import type { DocumentPayload } from '../types'

const accessLevel = z.enum(['restricted', 'confidential'])

export const documentSchema = z.object({
  category_id: z.string().trim().min(1, 'Select a document category.'),
  title: z
    .string()
    .trim()
    .min(1, 'Title is required.')
    .max(255, 'Title must be 255 characters or fewer.'),
  reference_no: z
    .string()
    .trim()
    .max(100, 'Reference number must be 100 characters or fewer.'),
  document_date: z.string().trim(),
  description: z
    .string()
    .trim()
    .max(10000, 'Description must be 10000 characters or fewer.'),
  remarks: z
    .string()
    .trim()
    .max(10000, 'Remarks must be 10000 characters or fewer.'),
  access_level: z.union([z.literal(''), accessLevel]),
})

export type DocumentFormValues = z.infer<typeof documentSchema>

function nullable(value: string): string | null {
  const trimmed = value.trim()

  return trimmed === '' ? null : trimmed
}

export function toDocumentPayload(
  values: DocumentFormValues,
): DocumentPayload {
  return {
    category_id: Number(values.category_id),
    title: values.title.trim(),
    reference_no: nullable(values.reference_no),
    document_date: nullable(values.document_date),
    description: nullable(values.description),
    remarks: nullable(values.remarks),
    access_level: values.access_level === '' ? null : values.access_level,
  }
}
