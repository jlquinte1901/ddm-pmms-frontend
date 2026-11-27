import { useState, type FormEvent } from 'react'
import { AlertCircle, Upload } from 'lucide-react'
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
import { getErrorMessage } from '@/shared/api/errors'
import { useToast } from '@/shared/components/toast/toast-context'
import { useAddDocumentVersion } from '../hooks/useDocumentMutations'

type AddVersionSheetProps = {
  documentId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddVersionSheet({
  documentId,
  open,
  onOpenChange,
}: AddVersionSheetProps) {
  const toast = useToast()
  const mutation = useAddDocumentVersion()
  const [file, setFile] = useState<File | null>(null)
  const [changeNote, setChangeNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setFile(null)
    setChangeNote('')
    setError(null)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (file === null) {
      setError('Select a file to upload.')
      return
    }

    try {
      const version = await mutation.mutateAsync({
        documentId,
        file,
        changeNote: changeNote.trim() === '' ? null : changeNote.trim(),
      })

      toast.success('New version uploaded', `Version ${version.version_number}`)
      reset()
      onOpenChange(false)
    } catch (uploadError) {
      setError(getErrorMessage(uploadError))
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          reset()
        }
        onOpenChange(value)
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Upload new version</SheetTitle>
          <SheetDescription>
            A new version is added; the previous versions are never overwritten.
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
            <Label htmlFor="version-file">File</Label>
            <Input
              id="version-file"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="version-note">Change note</Label>
            <Input
              id="version-note"
              value={changeNote}
              onChange={(event) => setChangeNote(event.target.value)}
              placeholder="What changed in this version?"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={mutation.isPending}>
              <Upload aria-hidden="true" />
              {mutation.isPending ? 'Uploading\u2026' : 'Upload version'}
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
