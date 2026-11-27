import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import {
  makeDocument,
  makeDocumentVersion,
  makeUser,
} from '@/test/fixtures'
import {
  documentDetailErrorHandler,
  documentDetailHandler,
} from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'
import { DocumentDetailPage } from './DocumentDetailPage'

const document = makeDocument({
  id: 7,
  title: 'Annual Budget Report',
  reference_no: 'BUD-2026-001',
  can_download: true,
  versions: [
    makeDocumentVersion({ id: 2, version_number: 2, original_name: 'v2.pdf' }),
    makeDocumentVersion({ id: 1, version_number: 1 }),
  ],
})

function renderDetail(permissions: string[] = ['ddm.documents.view']) {
  return renderWithProviders(
    <Routes>
      <Route
        path="/ddm/documents/:documentId"
        element={<DocumentDetailPage />}
      />
    </Routes>,
    {
      route: '/ddm/documents/7',
      user: makeUser({ permissions }),
    },
  )
}

describe('DocumentDetailPage', () => {
  it('renders the document details and version history', async () => {
    server.use(documentDetailHandler(document))

    renderDetail()

    expect(
      await screen.findByRole('heading', { name: 'Annual Budget Report' }),
    ).toBeInTheDocument()

    expect(screen.getByText('Restricted')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('BUD-2026-001')).toBeInTheDocument()
    expect(
      screen.getAllByText('annual-budget.pdf').length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('v1').length).toBeGreaterThan(0)
    expect(screen.getAllByText('v2').length).toBeGreaterThan(0)
    expect(
      screen.getByRole('button', { name: 'Download' }),
    ).toBeInTheDocument()
  })

  it('shows a not found state for a missing document', async () => {
    server.use(
      documentDetailErrorHandler(404, {
        message: 'The requested item could not be found.',
        code: 'not_found',
      }),
    )

    renderDetail()

    expect(await screen.findByText('Document not found')).toBeInTheDocument()
  })

  it('archives the document through the API', async () => {
    const user = userEvent.setup()
    const captured: { called: boolean } = { called: false }

    server.use(
      documentDetailHandler(document),
      http.post('*/api/v1/ddm/documents/7/archive', () => {
        captured.called = true

        return HttpResponse.json({ data: { ...document, is_archived: true } })
      }),
    )

    renderDetail(['ddm.documents.view', 'ddm.documents.archive'])

    await screen.findByRole('heading', { name: 'Annual Budget Report' })
    await user.click(screen.getByRole('button', { name: 'Archive' }))

    await waitFor(() => expect(captured.called).toBe(true))
  })
})
