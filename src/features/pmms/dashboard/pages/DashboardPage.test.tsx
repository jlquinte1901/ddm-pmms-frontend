import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { makeDashboardResponse, makeProject } from '@/test/fixtures'
import {
  dashboardErrorHandler,
  dashboardHandler,
} from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'
import { DashboardPage } from './DashboardPage'

function renderDashboard() {
  return renderWithProviders(<DashboardPage />, {
    route: '/pmms/dashboard',
  })
}

describe('DashboardPage', () => {
  it('renders the summary counts, indicator cards, and watchlist', async () => {
    const dashboard = makeDashboardResponse({
      counts: {
        total: 12,
        by_indicator: {
          normal: 4,
          critical: 3,
          overdue: 2,
          paused: 1,
          completed: 2,
          terminated: 0,
        },
        by_status: {
          not_started: 1,
          ongoing: 8,
          suspended: 1,
          postponed: 0,
          completed: 2,
          terminated: 0,
        },
      },
      totals: {
        contract_amount: '1500000.00',
        revised_amount: '1750000.00',
      },
      average_progress: 62,
      by_category: [
        { category_id: 1, category: 'Roads', count: 7 },
        { category_id: 2, category: 'Buildings', count: 5 },
      ],
      by_year: [
        { implementation_year: 2026, count: 9 },
        { implementation_year: 2025, count: 3 },
      ],
      watchlist: [
        makeProject({
          id: 10,
          project_name: 'Riverside Bridge Repair',
          contract_number: 'CED-2026-010',
          indicator: 'critical',
          indicator_label: 'Critical',
          days_remaining: 5,
          effective_finish_date: '2026-06-30',
          progress_percentage: 45,
        }),
        makeProject({
          id: 11,
          project_name: 'Drainage Improvement',
          contract_number: null,
          status: 'suspended',
          status_label: 'Suspended',
          indicator: 'paused',
          indicator_label: 'Paused',
          days_paused: 3,
          effective_finish_date: '2026-07-15',
          progress_percentage: 30,
        }),
      ],
    })

    server.use(dashboardHandler(dashboard))

    renderDashboard()

    expect(await screen.findByText('Total projects')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('62%')).toBeInTheDocument()
    expect(screen.getByText('\u20b11,500,000.00')).toBeInTheDocument()
    expect(screen.getByText('\u20b11,750,000.00')).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: 'Critical: 3 projects' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Overdue: 2 projects' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Terminated: 0 projects' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Normal: 4 projects' }),
    ).toHaveClass('border-indicator-normal-border')
    expect(
      screen.getByRole('link', { name: 'Overdue: 2 projects' }),
    ).toHaveClass('border-indicator-overdue-border')
    expect(
      screen.getByRole('link', { name: 'Terminated: 0 projects' }),
    ).toHaveClass('border-indicator-terminated-border')

    expect(screen.getByText('Riverside Bridge Repair')).toBeInTheDocument()
    expect(screen.getByText('CED-2026-010')).toBeInTheDocument()
    expect(screen.getByText('5 days remaining')).toBeInTheDocument()
    expect(screen.getByText('Jun 30, 2026')).toBeInTheDocument()

    expect(screen.getByText('Drainage Improvement')).toBeInTheDocument()
    expect(screen.getByText('3 days paused')).toBeInTheDocument()

    expect(screen.getByText('Roads')).toBeInTheDocument()
    expect(screen.getByText('2025')).toBeInTheDocument()
  })

  it('shows empty states when no projects are recorded', async () => {
    server.use(dashboardHandler(makeDashboardResponse()))

    renderDashboard()

    expect(
      await screen.findByText(/No projects have been recorded yet/),
    ).toBeInTheDocument()
    expect(screen.getByText('Nothing needs attention')).toBeInTheDocument()
    expect(
      screen.getByText('No categories have projects yet.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('No implementation years recorded yet.'),
    ).toBeInTheDocument()
  })

  it('shows an error state with retry when the dashboard is forbidden', async () => {
    server.use(
      dashboardErrorHandler(403, {
        message: 'This action is unauthorized.',
        code: 'forbidden',
      }),
    )

    renderDashboard()

    expect(
      await screen.findByText('The dashboard could not be loaded'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument()
  })
})
