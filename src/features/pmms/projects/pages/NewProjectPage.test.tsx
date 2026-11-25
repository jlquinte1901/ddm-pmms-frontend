import { describe, expect, it } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import {
  makePaginated,
  makeProject,
  makeProjectCategory,
} from '@/test/fixtures'
import {
  projectCategoriesHandler,
  projectCreateErrorHandler,
} from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'
import { NewProjectPage } from './NewProjectPage'

const categories = makePaginated([
  makeProjectCategory({ id: 1, name: 'Roads' }),
  makeProjectCategory({ id: 2, name: 'Buildings' }),
])

type User = ReturnType<typeof userEvent.setup>

async function fillRequiredFields(user: User) {
  await user.selectOptions(screen.getByLabelText('Project category'), '1')
  await user.type(screen.getByLabelText('Project name'), 'New Road Project')
  await user.type(screen.getByLabelText('Location'), 'Barangay Test')
  await user.type(screen.getByLabelText('Fund source'), 'Local Fund')
  await user.type(
    screen.getByLabelText('Contract amount'),
    '1,250,000.50',
  )
  fireEvent.change(screen.getByLabelText('Planned start date'), {
    target: { value: '2026-01-05' },
  })
  fireEvent.change(screen.getByLabelText('Planned finish date'), {
    target: { value: '2026-06-30' },
  })
}

describe('NewProjectPage', () => {
  it('submits the mapped payload without ownership fields', async () => {
    const user = userEvent.setup()
    const captured: { body: unknown } = { body: null }

    server.use(
      projectCategoriesHandler(categories),
      http.post('*/api/v1/pmms/projects', async ({ request }) => {
        captured.body = await request.json()

        return HttpResponse.json(
          {
            data: makeProject({
              id: 9,
              project_name: 'New Road Project',
            }),
          },
          { status: 201 },
        )
      }),
    )

    renderWithProviders(<NewProjectPage />)

    await screen.findByLabelText('Project category')
    await fillRequiredFields(user)
    await user.click(screen.getByRole('button', { name: 'Register project' }))

    await waitFor(() => {
      expect(captured.body).not.toBeNull()
    })

    expect(captured.body).toMatchObject({
      project_category_id: 1,
      project_name: 'New Road Project',
      contract_number: null,
      location: 'Barangay Test',
      region: null,
      lgu: null,
      department: null,
      implementing_office: null,
      project_manager: null,
      fund_source: 'Local Fund',
      contract_amount: '1250000.50',
      revised_amount: null,
      planned_start_date: '2026-01-05',
      planned_finish_date: '2026-06-30',
      contractor: null,
      remarks: null,
    })
    expect(captured.body).not.toHaveProperty('assigned_pe_id')
    expect(captured.body).not.toHaveProperty('created_by')
    expect(captured.body).not.toHaveProperty('status')
    expect(captured.body).not.toHaveProperty('progress_percentage')
  })

  it('maps validation errors to their fields', async () => {
    const user = userEvent.setup()

    server.use(
      projectCategoriesHandler(categories),
      projectCreateErrorHandler(422, {
        message: 'The given data was invalid.',
        code: 'validation_failed',
        errors: {
          contract_number: ['The contract number has already been taken.'],
        },
      }),
    )

    renderWithProviders(<NewProjectPage />)

    await screen.findByLabelText('Project category')
    await fillRequiredFields(user)
    await user.type(
      screen.getByLabelText('Contract number'),
      'CED-2026-001',
    )
    await user.click(screen.getByRole('button', { name: 'Register project' }))

    expect(
      await screen.findByText('The contract number has already been taken.'),
    ).toBeInTheDocument()
    expect(screen.getByText('The given data was invalid.')).toBeInTheDocument()
  })

  it('validates the required fields before submitting', async () => {
    const user = userEvent.setup()

    server.use(projectCategoriesHandler(categories))

    renderWithProviders(<NewProjectPage />)

    await screen.findByLabelText('Project category')
    await user.click(screen.getByRole('button', { name: 'Register project' }))

    expect(
      await screen.findByText('Select a project category.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Project name is required.')).toBeInTheDocument()
    expect(screen.getByText('Location is required.')).toBeInTheDocument()
    expect(screen.getByText('Fund source is required.')).toBeInTheDocument()
    expect(screen.getByText('Contract amount is required.')).toBeInTheDocument()
    expect(
      screen.getByText('Planned start date is required.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Planned finish date is required.'),
    ).toBeInTheDocument()
  })
})
