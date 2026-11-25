import { describe, expect, it } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { makePaginated, makeProject, makeProjectCategory } from '@/test/fixtures'
import {
  projectCategoriesHandler,
  projectDetailHandler,
} from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'
import { EditProjectPage } from './EditProjectPage'

const project = makeProject({
  id: 7,
  project_name: 'Highway Widening',
  contract_amount: '1500000.00',
  planned_start_date: '2026-01-05',
  planned_finish_date: '2026-06-30',
  status: 'not_started',
})

const categories = makePaginated([
  makeProjectCategory({ id: 1, name: 'Roads' }),
  makeProjectCategory({ id: 2, name: 'Buildings' }),
])

function renderEdit() {
  return renderWithProviders(
    <Routes>
      <Route path="/pmms/projects/:projectId/edit" element={<EditProjectPage />} />
    </Routes>,
    { route: '/pmms/projects/7/edit' },
  )
}

describe('EditProjectPage', () => {
  it('pre-fills the form and submits the update payload', async () => {
    const user = userEvent.setup()
    const captured: { body: unknown } = { body: null }

    server.use(
      projectDetailHandler(project),
      projectCategoriesHandler(categories),
      http.put('*/api/v1/pmms/projects/7', async ({ request }) => {
        captured.body = await request.json()

        return HttpResponse.json({
          data: { ...project, project_name: 'Highway Widening Phase 2' },
        })
      }),
    )

    renderEdit()

    const nameInput = await screen.findByLabelText('Project name')
    expect(nameInput).toHaveValue('Highway Widening')
    expect(screen.getByLabelText('Contract amount')).toHaveValue('1500000.00')
    expect(screen.getByLabelText('Actual start date')).toHaveValue('')

    await user.clear(nameInput)
    await user.type(nameInput, 'Highway Widening Phase 2')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(captured.body).not.toBeNull()
    })
    expect(captured.body).toMatchObject({
      project_name: 'Highway Widening Phase 2',
      project_category_id: 1,
      contract_amount: '1500000.00',
      planned_start_date: '2026-01-05',
      planned_finish_date: '2026-06-30',
      actual_start_date: null,
      actual_finish_date: null,
    })
    expect(captured.body).not.toHaveProperty('assigned_pe_id')
    expect(captured.body).not.toHaveProperty('created_by')
  })

  it('maps validation errors from the update endpoint', async () => {
    const user = userEvent.setup()

    server.use(
      projectDetailHandler(project),
      projectCategoriesHandler(categories),
      http.put('*/api/v1/pmms/projects/7', () =>
        HttpResponse.json(
          {
            message: 'The given data was invalid.',
            code: 'validation_failed',
            errors: {
              contract_number: ['The contract number has already been taken.'],
            },
          },
          { status: 422 },
        ),
      ),
    )

    renderEdit()

    await screen.findByLabelText('Project name')
    fireEvent.change(screen.getByLabelText('Contract number'), {
      target: { value: 'CED-2026-001' },
    })
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(
      await screen.findByText('The contract number has already been taken.'),
    ).toBeInTheDocument()
  })
})
