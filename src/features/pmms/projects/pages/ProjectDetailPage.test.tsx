import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import {
  makePaginated,
  makeProject,
  makeProjectCategory,
  makeProjectHistoryEntry,
  makeProjectUpdateEntry,
} from '@/test/fixtures'
import {
  projectDetailErrorHandler,
  projectDetailHandler,
  projectHistoryHandler,
  projectUpdatesHandler,
} from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'
import { ProjectDetailPage } from './ProjectDetailPage'

const project = makeProject({
  id: 7,
  project_name: 'Highway Widening',
  contract_number: 'CED-2026-007',
  category: makeProjectCategory({ id: 1, name: 'Roads' }),
  assigned_pe: { id: 2, full_name: 'Demo Project Engineer' },
  creator: { id: 2, full_name: 'Demo Project Engineer' },
  location: 'Barangay Poblacion',
  status: 'ongoing',
  status_label: 'Ongoing',
  indicator: 'critical',
  indicator_label: 'Critical',
  progress_percentage: 45,
  days_remaining: 12,
  effective_finish_date: '2026-12-07',
  contract_amount: '1500000.00',
  revised_amount: '1600000.00',
  remarks: 'Delayed by weather.',
})

const history = makePaginated([
  makeProjectHistoryEntry({
    id: 3,
    change_set_id: 'set-1',
    action: 'updated',
    field_name: 'progress_percentage',
    previous_value: 40,
    new_value: 45,
    reason: null,
    created_at: '2026-11-24T09:30:00+08:00',
  }),
  makeProjectHistoryEntry({
    id: 2,
    change_set_id: 'set-1',
    action: 'updated',
    field_name: 'status',
    previous_value: 'not_started',
    new_value: 'ongoing',
    reason: null,
    created_at: '2026-11-24T09:30:00+08:00',
  }),
  makeProjectHistoryEntry({
    id: 1,
    change_set_id: 'set-0',
    action: 'created',
    field_name: null,
    previous_value: null,
    new_value: { project_name: 'Highway Widening' },
    reason: null,
    created_at: '2026-11-20T08:00:00+08:00',
  }),
])

const updates = makePaginated([
  makeProjectUpdateEntry({
    id: 1,
    previous_progress: 40,
    progress_percentage: 45,
    accomplishment: 'Completed the base course.',
  }),
])

function renderDetail(route = '/pmms/projects/7') {
  return renderWithProviders(
    <Routes>
      <Route
        path="/pmms/projects/:projectId"
        element={<ProjectDetailPage />}
      />
    </Routes>,
    { route },
  )
}

describe('ProjectDetailPage', () => {
  it('renders the project, progress reports, and grouped history', async () => {
    server.use(
      projectDetailHandler(project),
      projectHistoryHandler(history),
      projectUpdatesHandler(updates),
    )

    renderDetail()

    expect(
      await screen.findByRole('heading', { name: 'Highway Widening' }),
    ).toBeInTheDocument()

    expect(screen.getAllByText('Ongoing').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Critical').length).toBeGreaterThan(0)
    expect(screen.getByText('12 days remaining')).toBeInTheDocument()
    expect(screen.getByText('Roads')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Roads \u00b7 2026 \u00b7 CED-2026-007 \u00b7 Barangay Poblacion',
      ),
    ).toBeInTheDocument()

    // Progress reports
    expect(
      await screen.findByText('Completed the base course.'),
    ).toBeInTheDocument()
    expect(
      screen.getAllByText('Demo Project Engineer').length,
    ).toBeGreaterThan(0)

    // History is grouped by change_set_id.
    expect(
      await screen.findByText('Project details updated'),
    ).toBeInTheDocument()
    expect(screen.getByText('Project registered')).toBeInTheDocument()
    expect(
      screen.getByText('Initial project record created.'),
    ).toBeInTheDocument()

    const historySection = screen.getByRole('region', {
      name: 'Project history',
    })

    expect(within(historySection).getByText(/Progress:/)).toBeInTheDocument()
    expect(within(historySection).getByText('Status:')).toBeInTheDocument()
    expect(within(historySection).getAllByText(/45%/).length).toBeGreaterThan(
      0,
    )
  })

  it('shows a not found state for an out-of-scope project', async () => {
    server.use(
      projectDetailErrorHandler(404, {
        message: 'The requested item could not be found.',
        code: 'not_found',
      }),
    )

    renderDetail()

    expect(await screen.findByText('Project not found')).toBeInTheDocument()
    expect(
      screen.getByText(
        'This project does not exist, or it is not within your access scope.',
      ),
    ).toBeInTheDocument()
  })

  it('shows an error state when the project cannot be loaded', async () => {
    server.use(
      projectDetailErrorHandler(403, {
        message: 'This action is unauthorized.',
        code: 'forbidden',
      }),
    )

    renderDetail()

    expect(
      await screen.findByText('The project could not be loaded'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument()
  })
})
