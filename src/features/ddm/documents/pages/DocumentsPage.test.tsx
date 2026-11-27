import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import {
  makeDocument,
  makeDocumentCategory,
  makePaginated,
  makeUser,
} from '@/test/fixtures'
import {
  documentCategoriesHandler,
  documentsErrorHandler,
  documentsHandler,
} from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'
import { DocumentsPage } from './DocumentsPage'

const categories = makePaginated([
  makeDocumentCategory({ id: 1, name: 'Budget Records' }),
])

function renderDocuments(
  route = '/ddm/documents',
  permissions: string[] = ['ddm.documents.view'],
) {
  return renderWithProviders(<DocumentsPage />, {
    route,
    user: makeUser({ permissions }),
  })
}

describe('DocumentsPage', () => {
  it('renders the document rows and pagination summary', async () => {
    server.use(
      documentsHandler(
        makePaginated([
          makeDocument({
            id: 7,
            title: 'Annual Budget Report',
            reference_no: 'BUD-2026-001',
            can_download: true,
          }),
        ]),
      ),
      documentCategoriesHandler(categories),
    )

    renderDocuments()

    expect(await screen.findByText('Annual Budget Report')).toBeInTheDocument()

    const table = screen.getByRole('table')

    expect(within(table).getByText('BUD-2026-001')).toBeInTheDocument()
    expect(within(table).getByText('Restricted')).toBeInTheDocument()
    expect(within(table).getByText('Active')).toBeInTheDocument()
    expect(within(table).getByText('v1')).toBeInTheDocument()
    expect(within(table).getByText('Jan 15, 2026')).toBeInTheDocument()
    expect(
      within(table).getByText(/annual-budget\.pdf/),
    ).toBeInTheDocument()
    expect(
      within(table).getByRole('button', { name: 'Download' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Showing 1\u20131 of 1')).toBeInTheDocument()
  })

  it('sends the search term and filters to the API', async () => {
    const user = userEvent.setup()
    const captured: { url: URL | null } = { url: null }

    server.use(
      http.get('*/api/v1/ddm/documents', ({ request }) => {
        captured.url = new URL(request.url)

        return HttpResponse.json(makePaginated([makeDocument()]))
      }),
      documentCategoriesHandler(categories),
    )

    renderDocuments()

    await screen.findByText('Annual Budget Report')
    await user.type(
      screen.getByLabelText('Search documents'),
      'budget{enter}',
    )

    await waitFor(() => {
      expect(captured.url?.searchParams.get('q')).toBe('budget')
    })

    await user.selectOptions(
      screen.getByLabelText('Access level'),
      'confidential',
    )
    await user.selectOptions(screen.getByLabelText('State'), 'archived')

    await waitFor(() => {
      expect(captured.url?.searchParams.get('access_level')).toBe(
        'confidential',
      )
      expect(captured.url?.searchParams.get('state')).toBe('archived')
    })
  })

  it('shows an empty state and clears filters', async () => {
    const user = userEvent.setup()

    server.use(
      documentsHandler(makePaginated([])),
      documentCategoriesHandler(categories),
    )

    renderDocuments('/ddm/documents?q=bridge')

    expect(
      await screen.findByText('No documents match these filters'),
    ).toBeInTheDocument()

    const clearButtons = screen.getAllByRole('button', {
      name: 'Clear filters',
    })

    await user.click(clearButtons[0])

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Clear filters' }),
      ).not.toBeInTheDocument()
    })
  })

  it('shows the request-access action when the document cannot be downloaded', async () => {
    server.use(
      documentsHandler(
        makePaginated([makeDocument({ can_download: false })]),
      ),
      documentCategoriesHandler(categories),
    )

    renderDocuments('/ddm/documents', [
      'ddm.documents.view',
      'ddm.downloads.request',
    ])

    expect(
      await screen.findByRole('button', { name: 'Request access' }),
    ).toBeInTheDocument()
  })

  it('submits a download request for a restricted document', async () => {
    const user = userEvent.setup()
    const captured: { body: unknown } = { body: null }

    server.use(
      documentsHandler(
        makePaginated([makeDocument({ id: 7, can_download: false })]),
      ),
      documentCategoriesHandler(categories),
      http.post(
        '*/api/v1/ddm/documents/7/download-requests',
        async ({ request }) => {
          captured.body = await request.json()

          return HttpResponse.json({ data: { id: 1 } }, { status: 201 })
        },
      ),
    )

    renderDocuments('/ddm/documents', [
      'ddm.documents.view',
      'ddm.downloads.request',
    ])

    await user.click(
      await screen.findByRole('button', { name: 'Request access' }),
    )
    await user.type(
      screen.getByLabelText('Reason'),
      'Required for the annual review.',
    )
    await user.click(screen.getByRole('button', { name: 'Submit request' }))

    await waitFor(() => expect(captured.body).not.toBeNull())
    expect(captured.body).toEqual({
      reason: 'Required for the annual review.',
    })
  })

  it('shows the upload link only with the upload permission', async () => {
    server.use(
      documentsHandler(makePaginated([makeDocument()])),
      documentCategoriesHandler(categories),
    )

    renderDocuments('/ddm/documents', [
      'ddm.documents.view',
      'ddm.documents.upload',
    ])

    expect(
      await screen.findByRole('link', { name: 'Upload document' }),
    ).toHaveAttribute('href', '/ddm/documents/new')
  })

  it('shows an error state when the list is forbidden', async () => {
    server.use(
      documentsErrorHandler(403, {
        message: 'This action is unauthorized.',
        code: 'forbidden',
      }),
      documentCategoriesHandler(categories),
    )

    renderDocuments()

    expect(
      await screen.findByText('Documents could not be loaded'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument()
  })
})
