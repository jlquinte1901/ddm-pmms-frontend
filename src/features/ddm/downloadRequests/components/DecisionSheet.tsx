import { useState, type FormEvent } from 'react'
import { AlertCircle, Check, X } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { getErrorMessage } from '@/shared/api/errors'
import { useToast } from '@/shared/components/toast/toast-context'
import type { DocumentDownloadRequest } from '@/shared/types/api'
import {
  useApproveDownloadRequest,
  useDenyDownloadRequest,
} from '../../documents/hooks/useDocumentMutations'

type DecisionSheetProps = {
  mode: 'approve' | 'deny'
  request: DocumentDownloadRequest
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DecisionSheet({
  mode,
  request,
  open,
  onOpenChange,
}: DecisionSheetProps) {
  const toast = useToast()
  const approveMutation = useApproveDownloadRequest()
  const denyMutation = useDenyDownloadRequest()
  const [decisionNote, setDecisionNote] = useState('')
  const [approvalDays, setApprovalDays] = useState('7')
  const [error, setError] = useState<string | null>(null)

  const pending = approveMutation.isPending || denyMutation.isPending
  const isApprove = mode === 'approve'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const note =
      decisionNote.trim() === '' ? null : decisionNote.trim()

    try {
      if (isApprove) {
        const days = Number.parseInt(approvalDays, 10)

        if (!Number.isInteger(days) || days < 1 || days > 30) {
          setError('Approval days must be between 1 and 30.')
          return
        }

        await approveMutation.mutateAsync({
          requestId: request.id,
          payload: { decision_note: note, approval_days: days },
        })
        toast.success('Download request approved')
      } else {
        await denyMutation.mutateAsync({
          requestId: request.id,
          payload: { decision_note: note },
        })
        toast.success('Download request denied')
      }

      onOpenChange(false)
    } catch (decisionError) {
      setError(getErrorMessage(decisionError))
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {isApprove ? 'Approve download request' : 'Deny download request'}
          </SheetTitle>
          <SheetDescription>
            {request.document?.title ?? 'This document'} requested by{' '}
            {request.requester?.full_name ?? 'a user'}.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={submit} className="space-y-4 px-4 pb-4">
          {error ? (
            <Alert variant="destructive">
              <AlertCircle aria-hidden="true" />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          ) : null}

          {isApprove ? (
            <div className="space-y-1.5">
              <Label htmlFor="approval-days">Approval window (days)</Label>
              <Input
                id="approval-days"
                type="number"
                min={1}
                max={30}
                value={approvalDays}
                onChange={(event) => setApprovalDays(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Between 1 and 30 days. The request expires after this window.
              </p>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="decision-note">Decision note</Label>
            <Textarea
              id="decision-note"
              rows={3}
              value={decisionNote}
              onChange={(event) => setDecisionNote(event.target.value)}
              placeholder={
                isApprove
                  ? 'Optional note for the requester.'
                  : 'Why is this request being denied?'
              }
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              variant={isApprove ? 'default' : 'destructive'}
              disabled={pending}
            >
              {isApprove ? (
                <Check aria-hidden="true" />
              ) : (
                <X aria-hidden="true" />
              )}
              {pending
                ? 'Saving\u2026'
                : isApprove
                  ? 'Approve request'
                  : 'Deny request'}
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
