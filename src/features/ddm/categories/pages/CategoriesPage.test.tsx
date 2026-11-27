import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import {
  makeDocumentCategory,
  makePaginated,
  makeUser,
} from '@/test/fixtures'
import { documentCategoriesHandler } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'
import { CategoriesPage } from './CategoriesPage'

const categories = makePaginated([
  makeDocumentCategory({ id: 1, name: 'Budget Records', documents_count: 3 }),
])

function renderCategories(permissions: string[] = ['ddm.categories.manage']) {
  return renderWithProviders(<CategoriesPage />, {
    route: '/ddm/categories',
    user: makeUser({ permissions }),
  })
}

describe('CategoriesPage', () => {
  it('renders the category rows', async () => {
    server.use(documentCategoriesHandler(categories))

    renderCategories()

    expect(await screen.findByText('Budget Records')).toBeInTheDocument()

    const table = screen.getByRole('table')

    expect(within(table).getByText('Restricted')).toBeInTheDocument()
    expect(within(table).getByText('Active')).toBeInTheDocument()
    expect(within(table).getByText('3')).toBeInTheDocument()
    expect(
      within(table).getByRole('button', { name: 'Edit' }),
    ).toBeInTheDocument()
  })

  it('sends the status filter to the API', async () => {
    const user = userEvent.setup()
    const captured: { url: URL | null } = { url: null }

    server.use(
      http.get('*/api/v1/ddm/categories', ({ request }) => {
        captured.url = new URL(request.url)

        return HttpResponse.json(categories)
      }),
    )

    renderCategories()

    await screen.findByText('Budget Records')
    await user.selectOptions(screen.getByLabelText('Status'), '1')

    await waitFor(() => {
      expect(captured.url?.searchParams.get('is_active')).toBe('1')
    })
  })

  it('creates a category', async () => {
    const user = userEvent.setup()
    const captured: { body: unknown } = { body: null }

    server.use(
      documentCategoriesHandler(categories),
      http.post('*/api/v1/ddm/categories', async ({ request }) => {
        captured.body = await request.json()

        return HttpResponse.json(
          { data: makeDocumentCategory({ name: 'Permits' }) },
          { status: 201 },
        )
      }),
    )

    renderCategories()
    await screen.findByText('Budget Records')
    await user.click(screen.getByRole('button', { name: 'New category' }))
    await user.type(screen.getByLabelText('Name'), 'Permits')
    await user.selectOptions(
      screen.getByLabelText('Default access level'),
      'confidential',
    )
    await user.click(screen.getByRole('button', { name: 'Create category' }))

    await waitFor(() => expect(captured.body).not.toBeNull())
    expect(captured.body).toEqual({
      name: 'Permits',
      default_access_level: 'confidential',
      is_active: true,
    })
  })

  it('edits a category', async () => {
    const user = userEvent.setup()
    const captured: { body: unknown } = { body: null }

    server.use(
      documentCategoriesHandler(categories),
      http.patch(
        '*/api/v1/ddm/categories/1',
        async ({ request }) => {
          captured.body = await request.json()

          return HttpResponse.json({
            data: makeDocumentCategory({ name: 'Budget Records Updated' }),
          })
        },
      ),
    )

    renderCategories()
    await screen.findByText('Budget Records')
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    const nameInput = screen.getByLabelText('Name')
    await user.clear(nameInput)
    await user.type(nameInput, 'Budget Records Updated')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(captured.body).not.toBeNull())
    expect(captured.body).toEqual({
      name: 'Budget Records Updated',
      default_access_level: 'restricted',
      is_active: true,
    })
  })

  it('shows an error state when the list is forbidden', async () => {
    server.use(
      http.get('*/api/v1/ddm/categories', () =>
        HttpResponse.json(
          { message: 'This action is unauthorized.', code: 'forbidden' },
          { status: 403 },
        ),
      ),
    )

    renderCategories()

    expect(
      await screen.findByText('Document categories could not be loaded'),
    ).toBeInTheDocument()
  })

  it('hides the management controls without permission', async () => {
    server.use(documentCategoriesHandler(categories))

    renderCategories(['ddm.documents.view'])

    await screen.findByText('Budget Records')
    expect(
      screen.queryByRole('button', { name: 'New category' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Edit' }),
    ).not.toBeInTheDocument()
  })
})
