import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import {
  makeDownloadRequest,
  makePaginated,
  makeUser,
} from '@/test/fixtures'
import {
  downloadRequestsErrorHandler,
  downloadRequestsHandler,
} from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'
import { DownloadRequestsPage } from './DownloadRequestsPage'

const approverPermissions = [
  'ddm.documents.view',
  'ddm.downloads.approve-restricted',
]

function renderPage(
  route = '/ddm/download-requests',
  permissions: string[] = approverPermissions,
) {
  return renderWithProviders(<DownloadRequestsPage />, {
    route,
    user: makeUser({ permissions }),
  })
}

describe('DownloadRequestsPage', () => {
  it('renders pending requests with decision actions', async () => {
    server.use(
      downloadRequestsHandler(makePaginated([makeDownloadRequest()])),
    )

    renderPage()

    expect(await screen.findByText('Annual Budget Report')).toBeInTheDocument()

    const table = screen.getByRole('table')

    expect(within(table).getByText('Viewer User')).toBeInTheDocument()
    expect(within(table).getByText('Pending')).toBeInTheDocument()
    expect(
      within(table).getByText('Required for the annual review.'),
    ).toBeInTheDocument()
    expect(
      within(table).getByRole('button', { name: 'Approve' }),
    ).toBeInTheDocument()
    expect(
      within(table).getByRole('button', { name: 'Deny' }),
    ).toBeInTheDocument()
  })

  it('sends the status filter to the API', async () => {
    const user = userEvent.setup()
    const captured: { url: URL | null } = { url: null }

    server.use(
      http.get('*/api/v1/ddm/download-requests', ({ request }) => {
        captured.url = new URL(request.url)

        return HttpResponse.json(makePaginated([makeDownloadRequest()]))
      }),
    )

    renderPage()

    await screen.findByText('Annual Budget Report')
    await user.selectOptions(screen.getByLabelText('Status'), 'pending')

    await waitFor(() => {
      expect(captured.url?.searchParams.get('status')).toBe('pending')
    })
  })

  it('approves a request with a note and approval window', async () => {
    const user = userEvent.setup()
    const captured: { body: unknown } = { body: null }

    server.use(
      downloadRequestsHandler(makePaginated([makeDownloadRequest()])),
      http.post(
        '*/api/v1/ddm/download-requests/1/approve',
        async ({ request }) => {
          captured.body = await request.json()

          return HttpResponse.json({
            data: makeDownloadRequest({
              status: 'approved',
              effective_status: 'approved',
            }),
          })
        },
      ),
    )

    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Approve' }))
    await user.type(
      screen.getByLabelText('Decision note'),
      'Approved for review.',
    )
    await user.click(screen.getByRole('button', { name: 'Approve request' }))

    await waitFor(() => expect(captured.body).not.toBeNull())
    expect(captured.body).toEqual({
      decision_note: 'Approved for review.',
      approval_days: 7,
    })
  })

  it('denies a request with a note', async () => {
    const user = userEvent.setup()
    const captured: { body: unknown } = { body: null }

    server.use(
      downloadRequestsHandler(makePaginated([makeDownloadRequest()])),
      http.post(
        '*/api/v1/ddm/download-requests/1/deny',
        async ({ request }) => {
          captured.body = await request.json()

          return HttpResponse.json({
            data: makeDownloadRequest({
              status: 'denied',
              effective_status: 'denied',
            }),
          })
        },
      ),
    )

    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Deny' }))
    await user.type(screen.getByLabelText('Decision note'), 'Not needed.')
    await user.click(screen.getByRole('button', { name: 'Deny request' }))

    await waitFor(() => expect(captured.body).not.toBeNull())
    expect(captured.body).toEqual({ decision_note: 'Not needed.' })
  })

  it('hides decisions for the requester own request', async () => {
    server.use(
      downloadRequestsHandler(
        makePaginated([
          makeDownloadRequest({
            requested_by: 1,
            requester: { id: 1, full_name: 'Test User' },
          }),
        ]),
      ),
    )

    renderPage()

    expect(await screen.findByText('Annual Budget Report')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Approve' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Awaiting approver')).toBeInTheDocument()
  })

  it('hides decisions without an approval permission', async () => {
    server.use(
      downloadRequestsHandler(makePaginated([makeDownloadRequest()])),
    )

    renderPage('/ddm/download-requests', ['ddm.documents.view'])

    expect(await screen.findByText('Awaiting approver')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Approve' }),
    ).not.toBeInTheDocument()
  })

  it('shows an error state when the queue cannot be loaded', async () => {
    server.use(
      downloadRequestsErrorHandler(403, {
        message: 'This action is unauthorized.',
        code: 'forbidden',
      }),
    )

    renderPage()

    expect(
      await screen.findByText('Download requests could not be loaded'),
    ).toBeInTheDocument()
  })
})
