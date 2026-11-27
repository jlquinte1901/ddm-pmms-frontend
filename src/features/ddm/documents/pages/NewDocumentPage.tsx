import { useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Upload } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { isApiError } from '@/shared/api/errors'
import { PageHeader } from '@/shared/components/PageHeader'
import { ErrorState, LoadingState } from '@/shared/components/states'
import { useToast } from '@/shared/components/toast/toast-context'
import { applyServerErrors } from '@/shared/lib/applyServerErrors'
import { useDocumentCategories } from '../hooks/useDocumentCategories'
import { useCreateDocument } from '../hooks/useDocumentMutations'
import {
  documentSchema,
  toDocumentPayload,
  type DocumentFormValues,
} from '../schemas/documentSchema'

const selectClassName =
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30'

const DEFAULT_VALUES: DocumentFormValues = {
  category_id: '',
  title: '',
  reference_no: '',
  document_date: '',
  description: '',
  remarks: '',
  access_level: '',
}

type FieldProps = {
  id: keyof DocumentFormValues
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: ReactNode
}

function Field({
  id,
  label,
  error,
  hint,
  required = false,
  className,
  children,
}: FieldProps) {
  return (
    <div className={className ? `space-y-1.5 ${className}` : 'space-y-1.5'}>
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

export function NewDocumentPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const categoriesQuery = useDocumentCategories()
  const createDocument = useCreateDocument()
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError(null)
    setFileError(null)

    if (file === null) {
      setFileError('Select a file to upload.')
      return
    }

    try {
      const document = await createDocument.mutateAsync({
        payload: toDocumentPayload(values),
        file,
      })

      toast.success('Document uploaded', document.title)
      navigate(`/ddm/documents/${document.id}`)
    } catch (error) {
      if (isApiError(error) && error.isValidationError) {
        const fileMessage = error.errors.file?.[0]

        if (fileMessage) {
          setFileError(fileMessage)
        }
      }

      applyServerErrors(form.setError, error, setServerError)
    }
  })

  function fieldError(name: keyof DocumentFormValues): string | undefined {
    return form.formState.errors[name]?.message
  }

  function fieldProps(name: keyof DocumentFormValues) {
    const error = fieldError(name)

    return {
      'aria-invalid': error !== undefined,
      'aria-describedby': error ? `${name}-error` : undefined,
    } as const
  }

  const submitting = createDocument.isPending || form.formState.isSubmitting

  return (
    <div className="space-y-5">
      <PageHeader
        title="Upload document"
        description="Register a DDM document and store its first version. Every download needs an approved request."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/ddm/documents')}
          >
            Back to documents
          </Button>
        }
      />

      {categoriesQuery.isPending ? (
        <LoadingState label="Loading document categories" />
      ) : null}

      {categoriesQuery.isError ? (
        <ErrorState
          error={categoriesQuery.error}
          title="Document categories could not be loaded"
          onRetry={() => void categoriesQuery.refetch()}
        />
      ) : null}

      {categoriesQuery.data ? (
        <form noValidate onSubmit={submit} className="space-y-5">
          {serverError ? (
            <Alert variant="destructive">
              <AlertCircle aria-hidden="true" />
              <AlertTitle>{serverError}</AlertTitle>
            </Alert>
          ) : null}

          <section className="rounded-xl border bg-card p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-foreground">
              Document details
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                id="category_id"
                label="Category"
                required
                error={fieldError('category_id')}
              >
                <select
                  id="category_id"
                  className={selectClassName}
                  {...fieldProps('category_id')}
                  {...form.register('category_id')}
                >
                  <option value="">Select a category</option>
                  {categoriesQuery.data.data.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                id="document_date"
                label="Document date"
                error={fieldError('document_date')}
              >
                <Input
                  id="document_date"
                  type="date"
                  {...fieldProps('document_date')}
                  {...form.register('document_date')}
                />
              </Field>

              <Field
                id="title"
                label="Title"
                required
                className="sm:col-span-2"
                error={fieldError('title')}
              >
                <Input
                  id="title"
                  autoComplete="off"
                  {...fieldProps('title')}
                  {...form.register('title')}
                />
              </Field>

              <Field
                id="reference_no"
                label="Reference number"
                error={fieldError('reference_no')}
              >
                <Input
                  id="reference_no"
                  autoComplete="off"
                  {...fieldProps('reference_no')}
                  {...form.register('reference_no')}
                />
              </Field>

              <Field
                id="access_level"
                label="Access level"
                hint="Leave empty to inherit the category default."
                error={fieldError('access_level')}
              >
                <select
                  id="access_level"
                  className={selectClassName}
                  {...fieldProps('access_level')}
                  {...form.register('access_level')}
                >
                  <option value="">Inherit from category</option>
                  <option value="restricted">Restricted</option>
                  <option value="confidential">Confidential</option>
                </select>
              </Field>

              <Field
                id="description"
                label="Description"
                className="sm:col-span-2"
                error={fieldError('description')}
              >
                <Textarea
                  id="description"
                  rows={3}
                  {...fieldProps('description')}
                  {...form.register('description')}
                />
              </Field>

              <Field
                id="remarks"
                label="Remarks"
                className="sm:col-span-2"
                error={fieldError('remarks')}
              >
                <Textarea
                  id="remarks"
                  rows={3}
                  {...fieldProps('remarks')}
                  {...form.register('remarks')}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-foreground">File</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF, Word, Excel, PowerPoint, JPEG, or PNG up to 50 MB.
            </p>
            <div className="mt-4 space-y-1.5">
              <Label htmlFor="file">First version</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                aria-invalid={fileError !== null}
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null)
                  setFileError(null)
                }}
              />
              {fileError ? (
                <p role="alert" className="text-sm text-destructive">
                  {fileError}
                </p>
              ) : file ? (
                <p className="text-xs text-muted-foreground">{file.name}</p>
              ) : null}
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={submitting}>
              <Upload aria-hidden="true" />
              {submitting ? 'Uploading\u2026' : 'Upload document'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/ddm/documents')}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
