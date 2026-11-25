import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import {
  makePaginated,
  makeProject,
  makeProjectCategory,
  makeUser,
} from '@/test/fixtures'
import {
  assignableEngineersHandler,
  projectCategoriesHandler,
  projectsErrorHandler,
  projectsHandler,
} from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'
import { ProjectsPage } from './ProjectsPage'

const categories = makePaginated([
  makeProjectCategory({ id: 1, name: 'Roads' }),
  makeProjectCategory({ id: 2, name: 'Buildings' }),
])

function renderProjects(route = '/pmms/projects') {
  return renderWithProviders(<ProjectsPage />, { route })
}

describe('ProjectsPage', () => {
  it('renders the project rows and pagination summary', async () => {
    const categoryRequest: { url: URL | null } = { url: null }

    server.use(
      projectsHandler(
        makePaginated([
          makeProject({
            id: 7,
            project_name: 'Highway Widening',
            contract_number: 'CED-2026-007',
            location: 'Barangay Poblacion',
            category: makeProjectCategory({ id: 1, name: 'Roads' }),
            status: 'ongoing',
            status_label: 'Ongoing',
            indicator: 'critical',
            indicator_label: 'Critical',
            progress_percentage: 45,
            effective_finish_date: '2026-06-30',
            contract_amount: '1500000.00',
          }),
        ]),
      ),
      http.get('*/api/v1/pmms/categories', ({ request }) => {
        categoryRequest.url = new URL(request.url)

        return HttpResponse.json(categories)
      }),
    )

    renderProjects()

    expect(await screen.findByText('Highway Widening')).toBeInTheDocument()

    const table = screen.getByRole('table')

    expect(within(table).getByText('CED-2026-007')).toBeInTheDocument()
    expect(within(table).getByText('Barangay Poblacion')).toBeInTheDocument()
    expect(within(table).getByText('Roads')).toBeInTheDocument()
    expect(within(table).getByText('Ongoing')).toBeInTheDocument()
    expect(within(table).getByText('Critical')).toBeInTheDocument()
    expect(within(table).getByText('45%')).toBeInTheDocument()
    expect(within(table).getByText('Jun 30, 2026')).toBeInTheDocument()
    expect(within(table).getByText('\u20b11,500,000.00')).toBeInTheDocument()
    expect(screen.getByText('Showing 1\u20131 of 1')).toBeInTheDocument()
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()

    // The backend's boolean rule accepts 1, not the string "true".
    expect(categoryRequest.url?.searchParams.get('is_active')).toBe('1')
  })

  it('sends the indicator query parameter from the dashboard link', async () => {
    const captured: { url: URL | null } = { url: null }

    server.use(
      http.get('*/api/v1/pmms/projects', ({ request }) => {
        captured.url = new URL(request.url)

        return HttpResponse.json(makePaginated([makeProject()]))
      }),
      projectCategoriesHandler(categories),
    )

    renderProjects('/pmms/projects?indicator=critical')

    expect(await screen.findByText('Sample Road Concreting')).toBeInTheDocument()
    expect(captured.url?.searchParams.get('indicator')).toBe('critical')
    expect(screen.getByLabelText('Indicator')).toHaveValue('critical')
  })

  it('applies a status filter through the URL and the API request', async () => {
    const user = userEvent.setup()
    const captured: { url: URL | null } = { url: null }

    server.use(
      http.get('*/api/v1/pmms/projects', ({ request }) => {
        captured.url = new URL(request.url)

        return HttpResponse.json(makePaginated([makeProject()]))
      }),
      projectCategoriesHandler(categories),
    )

    renderProjects()

    await screen.findByText('Sample Road Concreting')
    await user.selectOptions(screen.getByLabelText('Status'), 'ongoing')

    await waitFor(() => {
      expect(captured.url?.searchParams.get('status')).toBe('ongoing')
    })
    expect(screen.getByLabelText('Status')).toHaveValue('ongoing')
  })

  it('shows an empty state and clears filters', async () => {
    const user = userEvent.setup()

    server.use(
      projectsHandler(makePaginated([])),
      projectCategoriesHandler(categories),
    )

    renderProjects('/pmms/projects?q=bridge')

    expect(
      await screen.findByText('No projects match these filters'),
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
    expect(screen.getByLabelText('Search projects')).toHaveValue('')
  })

  it('shows the register link only with the create permission', async () => {
    server.use(
      projectsHandler(makePaginated([makeProject()])),
      projectCategoriesHandler(categories),
    )

    renderWithProviders(<ProjectsPage />, {
      route: '/pmms/projects',
      user: makeUser({ permissions: ['pmms.projects.create'] }),
    })

    expect(
      await screen.findByRole('link', { name: 'Register project' }),
    ).toHaveAttribute('href', '/pmms/projects/new')
  })

  it('shows the assigned-PE filter and sends the selected engineer', async () => {
    const user = userEvent.setup()
    const captured: { url: URL | null } = { url: null }

    server.use(
      http.get('*/api/v1/pmms/projects', ({ request }) => {
        captured.url = new URL(request.url)

        return HttpResponse.json(makePaginated([makeProject()]))
      }),
      projectCategoriesHandler(categories),
      assignableEngineersHandler([
        { id: 4, full_name: 'Demo Project Engineer' },
      ]),
    )

    renderWithProviders(<ProjectsPage />, {
      route: '/pmms/projects',
      user: makeUser({
        permissions: ['pmms.projects.view-all', 'pmms.projects.administer'],
      }),
    })

    await screen.findByText('Sample Road Concreting')
    await user.selectOptions(screen.getByLabelText('Assigned PE'), '4')

    await waitFor(() => {
      expect(captured.url?.searchParams.get('assigned_pe_id')).toBe('4')
    })
  })

  it('hides the register link without the create permission', async () => {
    server.use(
      projectsHandler(makePaginated([makeProject()])),
      projectCategoriesHandler(categories),
    )

    renderWithProviders(<ProjectsPage />, {
      route: '/pmms/projects',
      user: makeUser({ permissions: ['pmms.projects.view-own'] }),
    })

    await screen.findByText('Sample Road Concreting')

    expect(
      screen.queryByRole('link', { name: 'Register project' }),
    ).not.toBeInTheDocument()
  })

  it('shows an error state when the list is forbidden', async () => {
    server.use(
      projectsErrorHandler(403, {
        message: 'This action is unauthorized.',
        code: 'forbidden',
      }),
      projectCategoriesHandler(categories),
    )

    renderProjects()

    expect(
      await screen.findByText('Projects could not be loaded'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument()
  })
})
