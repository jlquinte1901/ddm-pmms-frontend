import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AlertCircle, Download, FileKey2 } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { isApiError, getErrorMessage } from '@/shared/api/errors'
import { useToast } from '@/shared/components/toast/toast-context'
import { applyServerErrors } from '@/shared/lib/applyServerErrors'
import type { Document } from '@/shared/types/api'
import { downloadDocument } from '../api'
import { useCreateDownloadRequest } from '../hooks/useDocumentMutations'
import {
  downloadRequestSchema,
  type DownloadRequestFormValues,
} from '../schemas/downloadRequestSchema'

type DocumentDownloadButtonProps = {
  document: Document
  canRequest: boolean
}

export function DocumentDownloadButton({
  document,
  canRequest,
}: DocumentDownloadButtonProps) {
  const toast = useToast()
  const requestMutation = useCreateDownloadRequest()
  const [downloading, setDownloading] = useState(false)
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<DownloadRequestFormValues>({
    resolver: zodResolver(downloadRequestSchema),
    defaultValues: { reason: '' },
  })

  const fallbackName =
    document.latest_version?.original_name ?? `${document.title}.pdf`

  async function handleDownload() {
    setDownloading(true)

    try {
      await downloadDocument(document.id, fallbackName)
      toast.success('Download started', fallbackName)
    } catch (error) {
      if (
        isApiError(error) &&
        error.status === 403 &&
        error.code === 'download_approval_required'
      ) {
        if (canRequest) {
          setOpen(true)
        } else {
          toast.error(
            'Approval required',
            'An approved download request is required for this document.',
          )
        }

        return
      }

      toast.error('Download failed', getErrorMessage(error))
    } finally {
      setDownloading(false)
    }
  }

  const submitRequest = form.handleSubmit(async (values) => {
    setServerError(null)

    try {
      await requestMutation.mutateAsync({
        documentId: document.id,
        reason: values.reason.trim(),
      })
      toast.success(
        'Request submitted',
        'An approver will review your download request.',
      )
      form.reset()
      setOpen(false)
    } catch (error) {
      applyServerErrors(form.setError, error, setServerError)
    }
  })

  const reasonError = form.formState.errors.reason?.message

  if (!document.can_download && !canRequest) {
    return null
  }

  return (
    <>
      {document.can_download ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={downloading}
          onClick={() => void handleDownload()}
        >
          <Download aria-hidden="true" />
          {downloading ? 'Downloading\u2026' : 'Download'}
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <FileKey2 aria-hidden="true" />
          Request access
        </Button>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Request download access</SheetTitle>
            <SheetDescription>
              {document.title} is {document.effective_access_level}. An
              approver must grant access before you can download it.
            </SheetDescription>
          </SheetHeader>

          <form
            noValidate
            onSubmit={submitRequest}
            className="space-y-4 px-4 pb-4"
          >
            {serverError ? (
              <Alert variant="destructive">
                <AlertCircle aria-hidden="true" />
                <AlertTitle>{serverError}</AlertTitle>
              </Alert>
            ) : null}

            <div className="space-y-1.5">
              <label
                htmlFor="download-reason"
                className="text-sm font-medium text-foreground"
              >
                Reason
              </label>
              <Textarea
                id="download-reason"
                rows={4}
                aria-invalid={reasonError !== undefined}
                {...form.register('reason')}
              />
              {reasonError ? (
                <p role="alert" className="text-sm text-destructive">
                  {reasonError}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  At least 10 characters. Recorded in the audit trail.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={requestMutation.isPending}>
                {requestMutation.isPending ? 'Submitting\u2026' : 'Submit request'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={requestMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
