import { ChakraProvider } from '@chakra-ui/react'
import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { baseApi } from '@/shared/api/baseApi'
import { TaskListPage } from '../TaskListPage'

vi.mock('@/entities/task/api', () => ({
  useGetTasksQuery: vi.fn(),
  useUpdateTaskStatusMutation: vi.fn(() => [vi.fn(), {}]),
  useCreateTaskMutation: vi.fn(() => [vi.fn(), {}]),
  useUpdateTaskMutation: vi.fn(() => [vi.fn(), {}]),
  useDeleteTaskMutation: vi.fn(() => [vi.fn(), {}]),
}))

vi.mock('@/entities/tag/api', () => ({
  useGetTagsQuery: vi.fn(),
  useCreateTagMutation: vi.fn(() => [vi.fn(), {}]),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

import { useGetTasksQuery } from '@/entities/task/api'
import { useGetTagsQuery } from '@/entities/tag/api'

function makeStore() {
  return configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer },
    middleware: (m) => m().concat(baseApi.middleware),
  })
}

function renderPage(url = '/') {
  return render(
    <Provider store={makeStore()}>
      <ChakraProvider>
        <MemoryRouter initialEntries={[url]}>
          <TaskListPage />
        </MemoryRouter>
      </ChakraProvider>
    </Provider>,
  )
}

const MOCK_TASKS = [
  {
    id: '1',
    title: 'Fix login bug',
    description: '',
    status: 'todo' as const,
    priority: 'high' as const,
    deadline: '2099-12-01',
    tags: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Write tests',
    description: '',
    status: 'inProgress' as const,
    priority: 'medium' as const,
    deadline: '2099-12-02',
    tags: [],
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
  },
]

describe('TaskListPage', () => {
  beforeEach(() => {
    vi.mocked(useGetTagsQuery).mockReturnValue({ data: [] } as any)
    mockNavigate.mockReset()
  })

  it('renders the heading and action buttons', () => {
    vi.mocked(useGetTasksQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: [], total: 0 },
    } as any)

    renderPage()

    expect(screen.getByRole('heading', { name: 'Tasks' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /\+ Add tag/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /\+ Add task/i })).toBeInTheDocument()
  })

  it('does not render the heading while loading', () => {
    vi.mocked(useGetTasksQuery).mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
    } as any)

    renderPage()

    expect(screen.queryByRole('heading', { name: 'Tasks' })).not.toBeInTheDocument()
  })

  it('renders an error message when the request fails', () => {
    vi.mocked(useGetTasksQuery).mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    } as any)

    renderPage()

    expect(screen.getByText(/Failed to load tasks/i)).toBeInTheDocument()
  })

  it('renders a card for each task', () => {
    vi.mocked(useGetTasksQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: MOCK_TASKS, total: 2 },
    } as any)

    renderPage()

    expect(screen.getByText('Fix login bug')).toBeInTheDocument()
    expect(screen.getByText('Write tests')).toBeInTheDocument()
  })

  it('shows an empty state when no tasks match filters', () => {
    vi.mocked(useGetTasksQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: [], total: 0 },
    } as any)

    renderPage()

    expect(screen.getByText(/No tasks match the current filters/i)).toBeInTheDocument()
  })

  it('navigates to the task detail page when a task card is clicked', async () => {
    vi.mocked(useGetTasksQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: MOCK_TASKS, total: 2 },
    } as any)

    renderPage()

    await userEvent.click(screen.getByText('Fix login bug'))
    expect(mockNavigate).toHaveBeenCalledWith('/tasks/1')
  })

  it('renders pagination when total exceeds one page (> 9 items)', () => {
    vi.mocked(useGetTasksQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: MOCK_TASKS, total: 20 },
    } as any)

    renderPage()

    expect(screen.getByRole('button', { name: '←' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '→' })).toBeInTheDocument()
  })

  it('hides pagination when all tasks fit on one page', () => {
    vi.mocked(useGetTasksQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: MOCK_TASKS, total: 2 },
    } as any)

    renderPage()

    expect(screen.queryByRole('button', { name: '←' })).not.toBeInTheDocument()
  })

  it('opens the tag modal when Add tag is clicked', async () => {
    vi.mocked(useGetTasksQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: [], total: 0 },
    } as any)

    renderPage()

    await userEvent.click(screen.getByRole('button', { name: /\+ Add tag/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
