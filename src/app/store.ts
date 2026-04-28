import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '@/shared/api/baseApi'

// Import entity API modules to register their endpoints on baseApi
import '@/entities/task/api'
import '@/entities/tag/api'

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
