import { ChakraProvider } from '@chakra-ui/react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TaskDetailPage } from '../TaskDetailPage'

vi.mock('@/entities/task/api', () => ({
  useGetTaskByIdQuery: vi.fn(),
  useDeleteTaskMutation: vi.fn(),
}))

vi.mock('@/entities/tag/api', () => ({
  useGetTagsQuery: vi.fn(),
}))

// Stub TaskFormModal to avoid the Chakra UI Radio / jsdom focus incompatibility.
// Whether the modal opens is the only thing we test from this page.
vi.mock('@/features/task-form', () => ({
  TaskFormModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div role="dialog" aria-label="Edit task" /> : null,
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({ id: 'task-1' }) }
})

import { useDeleteTaskMutation, useGetTaskByIdQuery } from '@/entities/task/api'
import { useGetTagsQuery } from '@/entities/tag/api'

const MOCK_TAGS = [
  { id: 'tag-1', name: 'Frontend' },
  { id: 'tag-2', name: 'Backend' },
]

const MOCK_TASK = {
  id: 'task-1',
  title: 'Fix login bug',
  description: 'Auth flow is broken on mobile',
  status: 'todo' as const,
  priority: 'high' as const,
  deadline: '2099-12-31',
  tags: ['tag-1'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-02T00:00:00Z',
}

const mockDeleteTask = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useGetTagsQuery).mockReturnValue({ data: MOCK_TAGS } as any)
  vi.mocked(useDeleteTaskMutation).mockReturnValue([mockDeleteTask, { isLoading: false }] as any)
  vi.mocked(useGetTaskByIdQuery).mockReturnValue({ isLoading: false, isError: false, data: MOCK_TASK } as any)
  mockDeleteTask.mockResolvedValue({})
})

function renderPage() {
  render(
    <MemoryRouter>
      <ChakraProvider>
        <TaskDetailPage />
      </ChakraProvider>
    </MemoryRouter>,
  )
}

describe('TaskDetailPage', () => {
  it('does not render the task title while loading', () => {
    vi.mocked(useGetTaskByIdQuery).mockReturnValue({ isLoading: true, isError: false, data: undefined } as any)
    renderPage()
    expect(screen.queryByText('Fix login bug')).not.toBeInTheDocument()
  })

  it('renders an error message when the task is not found', () => {
    vi.mocked(useGetTaskByIdQuery).mockReturnValue({ isLoading: false, isError: true, data: undefined } as any)
    renderPage()
    expect(screen.getByText('Task not found.')).toBeInTheDocument()
  })

  it('renders the task title and action buttons', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Fix login bug' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('renders the status badge', () => {
    renderPage()
    expect(screen.getByText('To Do')).toBeInTheDocument()
  })

  it('renders the priority badge', () => {
    renderPage()
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('renders resolved tag names', () => {
    renderPage()
    expect(screen.getByText('Frontend')).toBeInTheDocument()
  })

  it('shows "—" when the task has no tags', () => {
    vi.mocked(useGetTaskByIdQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { ...MOCK_TASK, tags: [] },
    } as any)
    renderPage()
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders the description when present', () => {
    renderPage()
    expect(screen.getByText('Auth flow is broken on mobile')).toBeInTheDocument()
  })

  it('does not render the description section when absent', () => {
    vi.mocked(useGetTaskByIdQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { ...MOCK_TASK, description: undefined },
    } as any)
    renderPage()
    expect(screen.queryByText('Auth flow is broken on mobile')).not.toBeInTheDocument()
  })

  it('shows "Overdue" when the deadline has passed and the status is not done', () => {
    vi.mocked(useGetTaskByIdQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { ...MOCK_TASK, deadline: '2020-01-01', status: 'todo' },
    } as any)
    renderPage()
    expect(screen.getByText(/Overdue/)).toBeInTheDocument()
  })

  it('does not show "Overdue" when the status is done', () => {
    vi.mocked(useGetTaskByIdQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { ...MOCK_TASK, deadline: '2020-01-01', status: 'done' },
    } as any)
    renderPage()
    expect(screen.queryByText(/Overdue/)).not.toBeInTheDocument()
  })

  it('navigates to "/" when "← Back" is clicked', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: '← Back' }))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('opens the edit modal when Edit is clicked', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('dialog', { name: 'Edit task' })).toBeInTheDocument()
  })

  describe('delete flow', () => {
    it('opens a confirmation dialog when Delete is clicked', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.click(screen.getByRole('button', { name: 'Delete' }))
      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
      expect(screen.getByText(/Are you sure/)).toBeInTheDocument()
    })

    it('shows the task title in the confirmation message', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.click(screen.getByRole('button', { name: 'Delete' }))
      expect(within(screen.getByRole('alertdialog')).getByText(/Fix login bug/)).toBeInTheDocument()
    })

    it('calls deleteTask with the task id and navigates to "/" on confirmation', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.click(screen.getByRole('button', { name: 'Delete' }))
      await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete' }))
      await waitFor(() => {
        expect(mockDeleteTask).toHaveBeenCalledWith('task-1')
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('does not call deleteTask when Cancel is clicked', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.click(screen.getByRole('button', { name: 'Delete' }))
      await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }))
      expect(mockDeleteTask).not.toHaveBeenCalled()
    })
  })
})
