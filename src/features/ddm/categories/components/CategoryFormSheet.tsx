import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useToast } from '@/shared/components/toast/toast-context'
import { applyServerErrors } from '@/shared/lib/applyServerErrors'
import type { DocumentCategory } from '@/shared/types/api'
import {
  useCreateCategory,
  useUpdateCategory,
} from '../hooks/useCategoryMutations'
import {
  categorySchema,
  toCategoryPayload,
  type CategoryFormValues,
} from '../schemas/categorySchema'

const selectClassName =
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30'

type CategoryFormSheetProps = {
  category: DocumentCategory | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryFormSheet({
  category,
  open,
  onOpenChange,
}: CategoryFormSheetProps) {
  const toast = useToast()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const [serverError, setServerError] = useState<string | null>(null)

  const isEdit = category !== null
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? '',
      default_access_level: category?.default_access_level ?? 'restricted',
      is_active: category?.is_active ?? true,
    },
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError(null)

    try {
      if (isEdit && category !== null) {
        await updateMutation.mutateAsync({
          categoryId: category.id,
          payload: toCategoryPayload(values),
        })
        toast.success('Category updated', values.name)
      } else {
        await createMutation.mutateAsync(toCategoryPayload(values))
        toast.success('Category created', values.name)
      }

      onOpenChange(false)
    } catch (error) {
      applyServerErrors(form.setError, error, setServerError)
    }
  })

  const pending = createMutation.isPending || updateMutation.isPending
  const nameError = form.formState.errors.name?.message
  const accessError = form.formState.errors.default_access_level?.message

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? 'Edit document category' : 'New document category'}
          </SheetTitle>
          <SheetDescription>
            Categories define the default access level for their documents.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={submit} className="space-y-4 px-4 pb-4">
          {serverError ? (
            <Alert variant="destructive">
              <AlertCircle aria-hidden="true" />
              <AlertTitle>{serverError}</AlertTitle>
            </Alert>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              autoComplete="off"
              aria-invalid={nameError !== undefined}
              {...form.register('name')}
            />
            {nameError ? (
              <p role="alert" className="text-sm text-destructive">
                {nameError}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category-access-level">Default access level</Label>
            <select
              id="category-access-level"
              className={selectClassName}
              aria-invalid={accessError !== undefined}
              {...form.register('default_access_level')}
            >
              <option value="restricted">Restricted</option>
              <option value="confidential">Confidential</option>
            </select>
            {accessError ? (
              <p role="alert" className="text-sm text-destructive">
                {accessError}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="category-is-active"
              type="checkbox"
              className="size-4"
              {...form.register('is_active')}
            />
            <Label htmlFor="category-is-active">Active</Label>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>
              {pending
                ? 'Saving\u2026'
                : isEdit
                  ? 'Save changes'
                  : 'Create category'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
