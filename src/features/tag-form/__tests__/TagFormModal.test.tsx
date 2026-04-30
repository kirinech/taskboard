import { ChakraProvider } from '@chakra-ui/react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TagFormModal } from '../TagFormModal'

vi.mock('@/entities/tag/api', () => ({
  useCreateTagMutation: vi.fn(),
  useGetTagsQuery: vi.fn(),
}))

import { useCreateTagMutation, useGetTagsQuery } from '@/entities/tag/api'

const mockCreateTag = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useCreateTagMutation).mockReturnValue([mockCreateTag, { isLoading: false }] as any)
  vi.mocked(useGetTagsQuery).mockReturnValue({ data: [] } as any)
  mockCreateTag.mockResolvedValue({})
})

function renderModal(props: { isOpen: boolean; onClose?: () => void }) {
  const onClose = props.onClose ?? vi.fn()
  render(
    <ChakraProvider>
      <TagFormModal isOpen={props.isOpen} onClose={onClose} />
    </ChakraProvider>,
  )
  return { onClose }
}

describe('TagFormModal', () => {
  describe('when closed', () => {
    it('renders nothing', () => {
      renderModal({ isOpen: false })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('when open', () => {
    it('renders the modal title, input, and action buttons', () => {
      renderModal({ isOpen: true })
      expect(screen.getByText('Add tag')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('e.g. Frontend')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('shows a validation error when submitted empty', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true })

      await user.click(screen.getByRole('button', { name: 'Create' }))

      expect(await screen.findByText('Tag name is required')).toBeInTheDocument()
    })

    it('shows a validation error for a name longer than 30 characters', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true })

      await user.type(screen.getByPlaceholderText('e.g. Frontend'), 'a'.repeat(31))
      await user.click(screen.getByRole('button', { name: 'Create' }))

      expect(await screen.findByText('Tag name must be 30 characters or fewer')).toBeInTheDocument()
    })

    it('shows a validation error for a duplicate tag name', async () => {
      vi.mocked(useGetTagsQuery).mockReturnValue({ data: [{ id: '1', name: 'Frontend' }] } as any)
      const user = userEvent.setup()
      renderModal({ isOpen: true })

      await user.type(screen.getByPlaceholderText('e.g. Frontend'), 'Frontend')
      await user.click(screen.getByRole('button', { name: 'Create' }))

      expect(await screen.findByText('A tag with this name already exists')).toBeInTheDocument()
    })

    it('duplicate check is case-insensitive', async () => {
      vi.mocked(useGetTagsQuery).mockReturnValue({ data: [{ id: '1', name: 'Frontend' }] } as any)
      const user = userEvent.setup()
      renderModal({ isOpen: true })

      await user.type(screen.getByPlaceholderText('e.g. Frontend'), 'FRONTEND')
      await user.click(screen.getByRole('button', { name: 'Create' }))

      expect(await screen.findByText('A tag with this name already exists')).toBeInTheDocument()
    })

    it('duplicate check ignores surrounding whitespace', async () => {
      vi.mocked(useGetTagsQuery).mockReturnValue({ data: [{ id: '1', name: 'Frontend' }] } as any)
      const user = userEvent.setup()
      renderModal({ isOpen: true })

      await user.type(screen.getByPlaceholderText('e.g. Frontend'), '  Frontend  ')
      await user.click(screen.getByRole('button', { name: 'Create' }))

      expect(await screen.findByText('A tag with this name already exists')).toBeInTheDocument()
    })

    it('does not call createTag when the form is invalid', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true })

      await user.click(screen.getByRole('button', { name: 'Create' }))
      await screen.findByText('Tag name is required')

      expect(mockCreateTag).not.toHaveBeenCalled()
    })

    it('calls createTag with the trimmed name and closes on valid submit', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      renderModal({ isOpen: true, onClose })

      await user.type(screen.getByPlaceholderText('e.g. Frontend'), 'NewTag')
      await user.click(screen.getByRole('button', { name: 'Create' }))

      await waitFor(() => {
        expect(mockCreateTag).toHaveBeenCalledWith({ name: 'NewTag' })
        expect(onClose).toHaveBeenCalled()
      })
    })

    it('calls onClose when Cancel is clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      renderModal({ isOpen: true, onClose })

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when the × button is clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      renderModal({ isOpen: true, onClose })

      await user.click(screen.getByRole('button', { name: 'Close' }))

      expect(onClose).toHaveBeenCalled()
    })
  })
})
