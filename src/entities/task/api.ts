import { baseApi } from '@/shared/api/baseApi'
import type { Task, TaskStatus } from '@/shared/types/task'

export interface TasksQueryParams {
  status?: TaskStatus
  priority?: Task['priority']
  tags?: string
  q?: string
  _sort?: 'createdAt' | 'deadline'
  _order?: 'asc' | 'desc'
  _page?: number
  _limit?: number
}

export interface TasksResponse {
  data: Task[]
  total: number
}

export type CreateTaskDto = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateTaskDto = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>

export const taskApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTasks: build.query<TasksResponse, TasksQueryParams | void>({
      query: (params) => ({ url: '/tasks', params: params ?? {} }),
      transformResponse: (data: Task[], meta) => ({
        data,
        // json-server returns total count in X-Total-Count when paginating
        total: parseInt(
          meta?.response?.headers.get('X-Total-Count') ?? String((data as Task[]).length),
          10,
        ),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Task' as const, id })),
              { type: 'Task', id: 'LIST' },
            ]
          : [{ type: 'Task', id: 'LIST' }],
    }),

    getTaskById: build.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Task', id }],
    }),

    createTask: build.mutation<Task, CreateTaskDto>({
      query: (body) => ({
        url: '/tasks',
        method: 'POST',
        body: {
          ...body,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
    }),

    updateTask: build.mutation<Task, { id: string; body: UpdateTaskDto }>({
      query: ({ id, body }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body: { ...body, id, updatedAt: new Date().toISOString() },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),

    updateTaskStatus: build.mutation<Task, { id: string; status: TaskStatus }>({
      query: ({ id, status }) => ({
        url: `/tasks/${id}`,
        method: 'PATCH',
        body: { status, updatedAt: new Date().toISOString() },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),

    deleteTask: build.mutation<void, string>({
      query: (id) => ({ url: `/tasks/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
} = taskApi
