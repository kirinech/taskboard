import { ChakraProvider } from '@chakra-ui/react'
import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { store } from '@/app/store'
import { TaskListPage } from '@/pages/TaskListPage'

const router = createBrowserRouter([
  { path: '/', element: <TaskListPage /> },
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
