import { baseApi } from '@/shared/api/baseApi'
import type { Tag } from '@/shared/types/task'

export const tagApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTags: build.query<Tag[], void>({
      query: () => '/tags',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Tag' as const, id })),
              { type: 'Tag', id: 'LIST' },
            ]
          : [{ type: 'Tag', id: 'LIST' }],
    }),

    createTag: build.mutation<Tag, Pick<Tag, 'name'>>({
      query: (body) => ({
        url: '/tags',
        method: 'POST',
        body: { ...body, id: crypto.randomUUID() },
      }),
      invalidatesTags: [{ type: 'Tag', id: 'LIST' }],
    }),
  }),
})

export const { useGetTagsQuery, useCreateTagMutation } = tagApi
