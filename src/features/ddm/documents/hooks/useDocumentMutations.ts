import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  addDocumentVersion,
  approveDownloadRequest,
  archiveDocument,
  createDocument,
  createDownloadRequest,
  deleteDocument,
  denyDownloadRequest,
  unarchiveDocument,
  updateDocument,
} from '../api'
import type {
  DocumentPayload,
  DownloadDecisionPayload,
} from '../types'

function useInvalidateDocuments() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: ['ddm'] })
  }
}

export function useCreateDocument() {
  const invalidate = useInvalidateDocuments()

  return useMutation({
    mutationFn: ({
      payload,
      file,
    }: {
      payload: DocumentPayload
      file: File
    }) => createDocument(payload, file),
    onSuccess: invalidate,
  })
}

export function useUpdateDocument() {
  const invalidate = useInvalidateDocuments()

  return useMutation({
    mutationFn: ({
      documentId,
      payload,
    }: {
      documentId: number
      payload: DocumentPayload
    }) => updateDocument(documentId, payload),
    onSuccess: invalidate,
  })
}

export function useAddDocumentVersion() {
  const invalidate = useInvalidateDocuments()

  return useMutation({
    mutationFn: ({
      documentId,
      file,
      changeNote,
    }: {
      documentId: number
      file: File
      changeNote: string | null
    }) => addDocumentVersion(documentId, file, changeNote),
    onSuccess: invalidate,
  })
}

export function useArchiveDocument() {
  const invalidate = useInvalidateDocuments()

  return useMutation({
    mutationFn: (documentId: number) => archiveDocument(documentId),
    onSuccess: invalidate,
  })
}

export function useUnarchiveDocument() {
  const invalidate = useInvalidateDocuments()

  return useMutation({
    mutationFn: (documentId: number) => unarchiveDocument(documentId),
    onSuccess: invalidate,
  })
}

export function useDeleteDocument() {
  const invalidate = useInvalidateDocuments()

  return useMutation({
    mutationFn: ({
      documentId,
      reason,
    }: {
      documentId: number
      reason: string
    }) => deleteDocument(documentId, reason),
    onSuccess: invalidate,
  })
}

export function useCreateDownloadRequest() {
  const invalidate = useInvalidateDocuments()

  return useMutation({
    mutationFn: ({
      documentId,
      reason,
    }: {
      documentId: number
      reason: string
    }) => createDownloadRequest(documentId, reason),
    onSuccess: invalidate,
  })
}

export function useApproveDownloadRequest() {
  const invalidate = useInvalidateDocuments()

  return useMutation({
    mutationFn: ({
      requestId,
      payload,
    }: {
      requestId: number
      payload: DownloadDecisionPayload
    }) => approveDownloadRequest(requestId, payload),
    onSuccess: invalidate,
  })
}

export function useDenyDownloadRequest() {
  const invalidate = useInvalidateDocuments()

  return useMutation({
    mutationFn: ({
      requestId,
      payload,
    }: {
      requestId: number
      payload: DownloadDecisionPayload
    }) => denyDownloadRequest(requestId, payload),
    onSuccess: invalidate,
  })
}
