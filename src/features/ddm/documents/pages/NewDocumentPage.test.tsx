import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiError } from '@/shared/api/errors'
import {
  makeDocument,
  makeDocumentCategory,
  makePaginated,
  makeUser,
} from '@/test/fixtures'
import { documentCategoriesHandler } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'
import { NewDocumentPage } from './NewDocumentPage'

const { createDocumentMock } = vi.hoisted(() => ({
  createDocumentMock: vi.fn(),
}))

vi.mock('../api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api')>()

  return { ...actual, createDocument: createDocumentMock }
})

const categories = makePaginated([
  makeDocumentCategory({ id: 1, name: 'Budget Records' }),
])

function renderNew() {
  return renderWithProviders(<NewDocumentPage />, {
    route: '/ddm/documents/new',
    user: makeUser({ permissions: ['ddm.documents.upload'] }),
  })
}

async function fillIdentity(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText('Category'), '1')
  await user.type(screen.getByLabelText('Title'), 'Annual Budget')
  fireEvent.change(screen.getByLabelText('Document date'), {
    target: { value: '2026-01-15' },
  })
}

describe('NewDocumentPage', () => {
  beforeEach(() => {
    createDocumentMock.mockReset()
    server.use(documentCategoriesHandler(categories))
  })

  it('submits the mapped payload with the file', async () => {
    const user = userEvent.setup()

    createDocumentMock.mockResolvedValue(
      makeDocument({ id: 9, title: 'Annual Budget' }),
    )

    renderNew()
    await screen.findByLabelText('Category')
    await fillIdentity(user)
    await user.upload(
      screen.getByLabelText('First version'),
      new File(['%PDF-1.4'], 'budget.pdf', { type: 'application/pdf' }),
    )
    await user.click(screen.getByRole('button', { name: 'Upload document' }))

    await waitFor(() => expect(createDocumentMock).toHaveBeenCalledTimes(1))

    const [payload, file] = createDocumentMock.mock.calls[0] as [
      Record<string, unknown>,
      File,
    ]

    expect(payload).toMatchObject({
      category_id: 1,
      title: 'Annual Budget',
      document_date: '2026-01-15',
      reference_no: null,
      description: null,
      access_level: null,
    })
    expect(file.name).toBe('budget.pdf')
  })

  it('validates the required fields', async () => {
    const user = userEvent.setup()

    renderNew()
    await screen.findByLabelText('Category')
    await user.click(screen.getByRole('button', { name: 'Upload document' }))

    expect(
      await screen.findByText('Select a document category.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Title is required.')).toBeInTheDocument()
    expect(createDocumentMock).not.toHaveBeenCalled()
  })

  it('requires a file and maps the file error from the API', async () => {
    const user = userEvent.setup()

    createDocumentMock.mockRejectedValue(
      new ApiError({
        status: 422,
        code: 'validation_failed',
        message: 'The given data was invalid.',
        errors: { file: ['The file must be a supported document type.'] },
      }),
    )

    renderNew()
    await screen.findByLabelText('Category')
    await fillIdentity(user)
    await user.click(screen.getByRole('button', { name: 'Upload document' }))

    expect(
      await screen.findByText('Select a file to upload.'),
    ).toBeInTheDocument()
    expect(createDocumentMock).not.toHaveBeenCalled()

    await user.upload(
      screen.getByLabelText('First version'),
      new File(['%PDF-1.4'], 'budget.pdf', { type: 'application/pdf' }),
    )
    await user.click(screen.getByRole('button', { name: 'Upload document' }))

    expect(
      await screen.findByText('The file must be a supported document type.'),
    ).toBeInTheDocument()
  })
})
