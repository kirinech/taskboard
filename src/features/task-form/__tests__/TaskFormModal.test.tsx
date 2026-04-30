import { ChakraProvider } from '@chakra-ui/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { TaskFormModal } from '../TaskFormModal'

// @zag-js/focus-visible (used by Chakra UI's Radio) overwrites HTMLElement.prototype.focus
// directly, but jsdom defines it as a non-writable / getter-only property. Make it writable
// so the assignment doesn't throw in the test environment.
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'focus', {
    configurable: true,
    writable: true,
    value: HTMLElement.prototype.focus,
  })
})

vi.mock('@/entities/task/api', () => ({
  useCreateTaskMutation: vi.fn(),
  useUpdateTaskMutation: vi.fn(),
}))

vi.mock('@/entities/tag/api', () => ({
  useGetTagsQuery: vi.fn(),
  useCreateTagMutation: vi.fn(),
}))

import { useCreateTaskMutation, useUpdateTaskMutation } from '@/entities/task/api'
import { useCreateTagMutation, useGetTagsQuery } from '@/entities/tag/api'

const MOCK_TAGS = [
  { id: 'tag-1', name: 'Frontend' },
  { id: 'tag-2', name: 'Backend' },
]

const MOCK_TASK = {
  id: 'task-1',
  title: 'Existing task title',
  description: 'Existing description',
  status: 'done' as const,
  priority: 'high' as const,
  deadline: '2099-06-15',
  tags: ['tag-1'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
}

const mockCreateTask = vi.fn()
const mockUpdateTask = vi.fn()
const mockCreateTag = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useCreateTaskMutation).mockReturnValue([mockCreateTask, { isLoading: false }] as any)
  vi.mocked(useUpdateTaskMutation).mockReturnValue([mockUpdateTask, { isLoading: false }] as any)
  vi.mocked(useGetTagsQuery).mockReturnValue({ data: MOCK_TAGS } as any)
  vi.mocked(useCreateTagMutation).mockReturnValue([mockCreateTag, { isLoading: false }] as any)
  mockCreateTask.mockResolvedValue({})
  mockUpdateTask.mockResolvedValue({})
  mockCreateTag.mockResolvedValue({ id: 'new-tag', name: 'New Tag' })
})

function renderModal(props: { isOpen: boolean; onClose?: () => void; task?: typeof MOCK_TASK }) {
  const onClose = props.onClose ?? vi.fn()
  render(
    <ChakraProvider>
      <TaskFormModal isOpen={props.isOpen} onClose={onClose} task={props.task} />
    </ChakraProvider>,
  )
  return { onClose }
}

describe('TaskFormModal', () => {
  describe('when closed', () => {
    it('renders nothing', () => {
      renderModal({ isOpen: false })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('create mode (no task prop)', () => {
    it('shows "Add task" as the modal title', () => {
      renderModal({ isOpen: true })
      expect(screen.getByText('Add task')).toBeInTheDocument()
    })

    it('renders all form fields', () => {
      renderModal({ isOpen: true })
      expect(screen.getByPlaceholderText('Task title…')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Optional description…')).toBeInTheDocument()
      expect(screen.getByText('Low')).toBeInTheDocument()
      expect(screen.getByText('Medium')).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Search or create tags…')).toBeInTheDocument()
    })

    it('shows validation errors when submitted empty', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true })

      await user.click(screen.getByRole('button', { name: 'Create task' }))

      expect(await screen.findByText('Title must be at least 5 characters')).toBeInTheDocument()
      expect(screen.getByText('Deadline is required')).toBeInTheDocument()
      expect(screen.getByText('At least 1 tag is required')).toBeInTheDocument()
    })

    it('shows a validation error for a title shorter than 5 characters', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true })

      await user.type(screen.getByPlaceholderText('Task title…'), 'Hi')
      await user.click(screen.getByRole('button', { name: 'Create task' }))

      expect(await screen.findByText('Title must be at least 5 characters')).toBeInTheDocument()
    })

    it('does not call createTask when the form is invalid', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true })

      await user.click(screen.getByRole('button', { name: 'Create task' }))
      await screen.findByText('Title must be at least 5 characters')

      expect(mockCreateTask).not.toHaveBeenCalled()
    })

    it('calls createTask with correct values and closes on valid submit', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      renderModal({ isOpen: true, onClose })

      await user.type(screen.getByPlaceholderText('Task title…'), 'New valid task')
      fireEvent.change(screen.getByLabelText('Deadline'), { target: { value: '2099-12-31' } })

      await user.click(screen.getByPlaceholderText('Search or create tags…'))
      await user.click(screen.getByText('Frontend'))

      await user.click(screen.getByRole('button', { name: 'Create task' }))

      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New valid task',
            deadline: '2099-12-31',
            tags: ['tag-1'],
          }),
        )
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

    it('selects a tag from the autocomplete dropdown', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true })

      await user.click(screen.getByPlaceholderText('Search or create tags…'))
      await user.click(screen.getByText('Backend'))

      // The selected tag is shown as a chip above the input
      expect(screen.getByText('Backend')).toBeInTheDocument()
    })

    it('filters autocomplete suggestions by input text', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true })

      await user.type(screen.getByPlaceholderText('Search or create tags…'), 'Front')

      expect(screen.getByText('Frontend')).toBeInTheDocument()
      expect(screen.queryByText('Backend')).not.toBeInTheDocument()
    })
  })

  describe('edit mode (task prop provided)', () => {
    it('shows "Edit task" as the modal title', () => {
      renderModal({ isOpen: true, task: MOCK_TASK })
      expect(screen.getByText('Edit task')).toBeInTheDocument()
    })

    it('shows "Save changes" as the submit button label', () => {
      renderModal({ isOpen: true, task: MOCK_TASK })
      expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
    })

    it('pre-fills the title with the task title', () => {
      renderModal({ isOpen: true, task: MOCK_TASK })
      expect(screen.getByPlaceholderText('Task title…')).toHaveValue('Existing task title')
    })

    it('pre-fills the description', () => {
      renderModal({ isOpen: true, task: MOCK_TASK })
      expect(screen.getByPlaceholderText('Optional description…')).toHaveValue('Existing description')
    })

    it('pre-fills the deadline', () => {
      renderModal({ isOpen: true, task: MOCK_TASK })
      expect(screen.getByLabelText('Deadline')).toHaveValue('2099-06-15')
    })

    it('shows existing tags as selected chips', () => {
      renderModal({ isOpen: true, task: MOCK_TASK })
      // tag-1 resolves to 'Frontend' — shown as a chip above the input before any dropdown opens
      expect(screen.getByText('Frontend')).toBeInTheDocument()
    })

    it('calls updateTask (not createTask) with correct values and closes on submit', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      renderModal({ isOpen: true, task: MOCK_TASK, onClose })

      await user.click(screen.getByRole('button', { name: 'Save changes' }))

      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'task-1',
            body: expect.objectContaining({
              title: 'Existing task title',
              tags: ['tag-1'],
            }),
          }),
        )
        expect(mockCreateTask).not.toHaveBeenCalled()
        expect(onClose).toHaveBeenCalled()
      })
    })
  })
})
