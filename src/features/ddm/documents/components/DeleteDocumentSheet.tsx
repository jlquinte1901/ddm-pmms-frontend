import { useState, type FormEvent } from 'react'
import { AlertCircle, Trash2 } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { getErrorMessage } from '@/shared/api/errors'
import { useToast } from '@/shared/components/toast/toast-context'
import { useDeleteDocument } from '../hooks/useDocumentMutations'

type DeleteDocumentSheetProps = {
  documentId: number
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}

export function DeleteDocumentSheet({
  documentId,
  title,
  open,
  onOpenChange,
  onDeleted,
}: DeleteDocumentSheetProps) {
  const toast = useToast()
  const mutation = useDeleteDocument()
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (reason.trim() === '') {
      setError('Reason is required.')
      return
    }

    try {
      await mutation.mutateAsync({ documentId, reason: reason.trim() })
      toast.success('Document deleted', title)
      setReason('')
      onOpenChange(false)
      onDeleted()
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Delete document</SheetTitle>
          <SheetDescription>
            This soft-deletes {title}. Its versions and audit trail are
            preserved.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={submit} className="space-y-4 px-4 pb-4">
          {error ? (
            <Alert variant="destructive">
              <AlertCircle aria-hidden="true" />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="delete-document-reason">Reason</Label>
            <Textarea
              id="delete-document-reason"
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              variant="destructive"
              disabled={mutation.isPending}
            >
              <Trash2 aria-hidden="true" />
              {mutation.isPending ? 'Deleting\u2026' : 'Delete document'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
