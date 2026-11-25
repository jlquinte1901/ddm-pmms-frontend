import { describe, expect, it } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { makeProject, makeUser } from '@/test/fixtures'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'
import { ProjectActions } from './ProjectActions'

const ongoingProject = makeProject({
  id: 7,
  status: 'ongoing',
  status_label: 'Ongoing',
  progress_percentage: 40,
})

const notStartedProject = makeProject({
  id: 7,
  status: 'not_started',
  status_label: 'Not Started',
  progress_percentage: 0,
})

const pausedProject = makeProject({
  id: 7,
  status: 'suspended',
  status_label: 'Suspended',
  progress_percentage: 45,
})

function renderActions(project = ongoingProject) {
  return renderWithProviders(<ProjectActions project={project} />, {
    user: makeUser({ permissions: ['pmms.projects.manage-own'] }),
  })
}

describe('ProjectActions', () => {
  it('shows the actions available for an ongoing project', () => {
    renderActions(ongoingProject)

    expect(screen.getByRole('button', { name: 'Report progress' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pause project' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Edit details' })).toHaveAttribute(
      'href',
      '/pmms/projects/7/edit',
    )
    expect(screen.queryByRole('button', { name: 'Start project' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Resume project' })).not.toBeInTheDocument()
  })

  it('shows the start action only for a not started project', () => {
    renderActions(notStartedProject)

    expect(screen.getByRole('button', { name: 'Start project' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Resume project' })).not.toBeInTheDocument()
  })

  it('shows the resume action only for a paused project', () => {
    renderActions(pausedProject)

    expect(screen.getByRole('button', { name: 'Resume project' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Report progress' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pause project' })).not.toBeInTheDocument()
  })

  it('submits a progress report with the mapped payload', async () => {
    const user = userEvent.setup()
    const captured: { body: unknown } = { body: null }

    server.use(
      http.post('*/api/v1/pmms/projects/7/progress', async ({ request }) => {
        captured.body = await request.json()

        return HttpResponse.json({ data: ongoingProject })
      }),
    )

    renderActions(ongoingProject)
    await user.click(screen.getByRole('button', { name: 'Report progress' }))

    fireEvent.change(screen.getByLabelText('Progress percentage'), {
      target: { value: '60' },
    })
    fireEvent.change(screen.getByLabelText('Accomplishment'), {
      target: { value: 'Completed the base course.' },
    })
    await user.click(screen.getByRole('button', { name: 'Save progress' }))

    await waitFor(() => {
      expect(captured.body).not.toBeNull()
    })
    expect(captured.body).toMatchObject({
      report_date: expect.any(String) as string,
      progress_percentage: 60,
      accomplishment: 'Completed the base course.',
      remarks: null,
    })
  })

  it('requires remarks when progress is lowered', async () => {
    const user = userEvent.setup()

    renderActions(ongoingProject)
    await user.click(screen.getByRole('button', { name: 'Report progress' }))

    fireEvent.change(screen.getByLabelText('Progress percentage'), {
      target: { value: '30' },
    })
    await user.click(screen.getByRole('button', { name: 'Save progress' }))

    expect(
      await screen.findByText('Remarks are required when progress is lowered.'),
    ).toBeInTheDocument()
  })

  it('requires confirmation when reporting 100% progress', async () => {
    const user = userEvent.setup()

    renderActions(ongoingProject)
    await user.click(screen.getByRole('button', { name: 'Report progress' }))

    fireEvent.change(screen.getByLabelText('Progress percentage'), {
      target: { value: '100' },
    })
    await user.click(screen.getByRole('button', { name: 'Save progress' }))

    expect(
      await screen.findByText(
        'Confirm that 100% progress completes the project.',
      ),
    ).toBeInTheDocument()
  })

  it('validates the pause reason length', async () => {
    const user = userEvent.setup()

    renderActions(ongoingProject)
    await user.click(screen.getByRole('button', { name: 'Pause project' }))

    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Too short' },
    })
    await user.click(screen.getByRole('button', { name: 'Confirm pause' }))

    expect(
      await screen.findByText('Reason must be at least 10 characters.'),
    ).toBeInTheDocument()
  })
})
