import { ChakraProvider } from '@chakra-ui/react'
import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { store } from '@/app/store'
import { TaskDetailPage } from '@/pages/TaskDetailPage'
import { TaskListPage } from '@/pages/TaskListPage'

const router = createBrowserRouter([
  { path: '/', element: <TaskListPage /> },
  { path: '/tasks/:id', element: <TaskDetailPage /> },
])

export function App() {
  return (
    <Provider store={store}>
      <ChakraProvider>
        <RouterProvider router={router} />
      </ChakraProvider>
    </Provider>
  )
}
