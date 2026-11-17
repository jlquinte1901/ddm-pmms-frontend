import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router-dom'
import { renderWithProviders } from '@/test/render'
import { useUrlFilters } from './useUrlFilters'

function FiltersProbe() {
  const location = useLocation()
  const {
    filters,
    setFilter,
    setPage,
    setPerPage,
    clearFilters,
    page,
    perPage,
  } = useUrlFilters()

  return (
    <div>
      <output data-testid="search">{location.search}</output>
      <output data-testid="status">{filters.status ?? 'none'}</output>
      <output data-testid="page">{page}</output>
      <output data-testid="per-page">{perPage}</output>
      <button type="button" onClick={() => setFilter('status', 'ongoing')}>
        Set status
      </button>
      <button type="button" onClick={() => setFilter('category_id', 2)}>
        Set category
      </button>
      <button type="button" onClick={() => setPage(4)}>
        Page four
      </button>
      <button type="button" onClick={() => setPerPage(250)}>
        Large page
      </button>
      <button type="button" onClick={clearFilters}>
        Clear
      </button>
    </div>
  )
}

describe('useUrlFilters', () => {
  it('reads filters and pagination from the URL', () => {
    renderWithProviders(<FiltersProbe />, {
      route: '/projects?status=completed&page=3&per_page=25',
    })

    expect(screen.getByTestId('status')).toHaveTextContent('completed')
    expect(screen.getByTestId('page')).toHaveTextContent('3')
    expect(screen.getByTestId('per-page')).toHaveTextContent('25')
  })

  it('resets the page when a filter changes', async () => {
    const user = userEvent.setup()

    renderWithProviders(<FiltersProbe />, {
      route: '/projects?page=3',
    })

    await user.click(screen.getByRole('button', { name: 'Set status' }))

    expect(screen.getByTestId('search')).toHaveTextContent('status=ongoing')
    expect(screen.getByTestId('search')).not.toHaveTextContent('page=3')
  })

  it('writes numeric filters as strings', async () => {
    const user = userEvent.setup()

    renderWithProviders(<FiltersProbe />, { route: '/projects' })

    await user.click(screen.getByRole('button', { name: 'Set category' }))

    expect(screen.getByTestId('search')).toHaveTextContent('category_id=2')
  })

  it('clamps the page size to the API maximum of 100', async () => {
    const user = userEvent.setup()

    renderWithProviders(<FiltersProbe />, {
      route: '/projects?page=3&per_page=25',
    })

    await user.click(screen.getByRole('button', { name: 'Large page' }))

    expect(screen.getByTestId('search')).toHaveTextContent('per_page=100')
    expect(screen.getByTestId('search')).not.toHaveTextContent('page=3')
    expect(screen.getByTestId('per-page')).toHaveTextContent('100')
  })

  it('clears every filter', async () => {
    const user = userEvent.setup()

    renderWithProviders(<FiltersProbe />, {
      route: '/projects?status=completed&page=3',
    })

    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(screen.getByTestId('search')).toHaveTextContent('')
    expect(screen.getByTestId('status')).toHaveTextContent('none')
    expect(screen.getByTestId('page')).toHaveTextContent('1')
  })
})
