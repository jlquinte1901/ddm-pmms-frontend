import { describe, expect, it } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { makeProject, makeUser } from '@/test/fixtures'
import { assignableEngineersHandler } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'
import { ProjectAdminActions } from './ProjectAdminActions'

const ongoing = makeProject({ id: 7, status: 'ongoing', status_label: 'Ongoing' })
const completed = makeProject({
  id: 7,
  status: 'completed',
  status_label: 'Completed',
})

function renderAdmin(project = ongoing) {
  return renderWithProviders(<ProjectAdminActions project={project} />, {
    user: makeUser({ permissions: ['pmms.projects.administer'] }),
  })
}

describe('ProjectAdminActions', () => {
  it('shows terminate, reassign, and delete for an ongoing project', () => {
    renderAdmin()

    expect(screen.getByRole('button', { name: 'Terminate' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reassign' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reopen' })).not.toBeInTheDocument()
  })

  it('shows reopen only for a completed project', () => {
    renderAdmin(completed)

    expect(screen.getByRole('button', { name: 'Reopen' })).toBeInTheDocument()
  })

  it('hides the section without the administer permission', () => {
    renderWithProviders(<ProjectAdminActions project={ongoing} />, {
      user: makeUser({ permissions: ['pmms.projects.view-all'] }),
    })

    expect(
      screen.queryByRole('button', { name: 'Terminate' }),
    ).not.toBeInTheDocument()
  })

  it('submits a terminate request with the reason', async () => {
    const user = userEvent.setup()
    const captured: { body: unknown } = { body: null }

    server.use(
      http.post('*/api/v1/pmms/projects/7/terminate', async ({ request }) => {
        captured.body = await request.json()

        return HttpResponse.json({ data: { ...ongoing, status: 'terminated' } })
      }),
    )

    renderAdmin()
    await user.click(screen.getByRole('button', { name: 'Terminate' }))
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Contract terminated.' },
    })
    await user.click(screen.getByRole('button', { name: 'Confirm terminate' }))

    await waitFor(() => expect(captured.body).not.toBeNull())
    expect(captured.body).toEqual({ reason: 'Contract terminated.' })
  })

  it('submits a reopen request with progress and reason', async () => {
    const user = userEvent.setup()
    const captured: { body: unknown } = { body: null }

    server.use(
      http.post('*/api/v1/pmms/projects/7/reopen', async ({ request }) => {
        captured.body = await request.json()

        return HttpResponse.json({ data: { ...completed, status: 'ongoing' } })
      }),
    )

    renderAdmin(completed)
    await user.click(screen.getByRole('button', { name: 'Reopen' }))
    fireEvent.change(screen.getByLabelText('Progress percentage'), {
      target: { value: '50' },
    })
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Reopened for additional works.' },
    })
    await user.click(screen.getByRole('button', { name: 'Confirm reopen' }))

    await waitFor(() => expect(captured.body).not.toBeNull())
    expect(captured.body).toEqual({
      reason: 'Reopened for additional works.',
      progress_percentage: 50,
    })
  })

  it('submits a reassign request with the selected engineer', async () => {
    const user = userEvent.setup()
    const captured: { body: unknown } = { body: null }

    server.use(
      assignableEngineersHandler([
        { id: 4, full_name: 'Demo Project Engineer' },
      ]),
      http.post('*/api/v1/pmms/projects/7/reassign', async ({ request }) => {
        captured.body = await request.json()

        return HttpResponse.json({ data: { ...ongoing, assigned_pe_id: 4 } })
      }),
    )

    renderAdmin()
    await user.click(screen.getByRole('button', { name: 'Reassign' }))
    await screen.findByLabelText('Project Engineer')
    await user.selectOptions(screen.getByLabelText('Project Engineer'), '4')
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Reassigned to a new engineer.' },
    })
    await user.click(screen.getByRole('button', { name: 'Confirm reassign' }))

    await waitFor(() => expect(captured.body).not.toBeNull())
    expect(captured.body).toEqual({
      assigned_pe_id: 4,
      reason: 'Reassigned to a new engineer.',
    })
  })

  it('submits a planned-date correction with the dates and reason', async () => {
    const user = userEvent.setup()
    const captured: { body: unknown } = { body: null }

    server.use(
      http.post(
        '*/api/v1/pmms/projects/7/correct-planned-dates',
        async ({ request }) => {
          captured.body = await request.json()

          return HttpResponse.json({ data: ongoing })
        },
      ),
    )

    renderAdmin()
    await user.click(
      screen.getByRole('button', { name: 'Correct planned dates' }),
    )
    fireEvent.change(screen.getByLabelText('Planned finish date'), {
      target: { value: '2026-07-31' },
    })
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Corrected per variation order.' },
    })
    await user.click(screen.getByRole('button', { name: 'Confirm correction' }))

    await waitFor(() => expect(captured.body).not.toBeNull())
    expect(captured.body).toEqual({
      planned_start_date: '2026-01-05',
      planned_finish_date: '2026-07-31',
      reason: 'Corrected per variation order.',
    })
  })

  it('submits a delete request with the reason', async () => {
    const user = userEvent.setup()
    const captured: { body: unknown } = { body: null }

    server.use(
      http.delete('*/api/v1/pmms/projects/7', async ({ request }) => {
        captured.body = await request.json()

        return new HttpResponse(null, { status: 204 })
      }),
    )

    renderAdmin()
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Duplicate record.' },
    })
    await user.click(screen.getByRole('button', { name: 'Delete project' }))

    await waitFor(() => expect(captured.body).not.toBeNull())
    expect(captured.body).toEqual({ reason: 'Duplicate record.' })
  })
})
