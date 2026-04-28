import { Box, Center, Heading, SimpleGrid, Spinner, Text } from '@chakra-ui/react'
import { useGetTagsQuery } from '@/entities/tag/api'
import { useGetTasksQuery } from '@/entities/task/api'
import { TaskCard } from '@/entities/task/ui/TaskCard'
import type { Tag } from '@/shared/types/task'

export function TaskListPage() {
  const { data: tasksData, isLoading, isError } = useGetTasksQuery()
  const { data: tags = [] } = useGetTagsQuery()

  const tagMap = Object.fromEntries(tags.map((tag) => [tag.id, tag]))

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (isError) {
    return (
      <Center h="100vh">
        <Text color="red.500">Failed to load tasks. Make sure json-server is running.</Text>
      </Center>
    )
  }

  const tasks = tasksData?.data ?? []

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <Heading mb={6}>Tasks</Heading>

      {tasks.length === 0 ? (
        <Text color="gray.500">No tasks yet.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              tags={task.tags
                .map((id) => tagMap[id])
                .filter((t): t is Tag => Boolean(t))}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  )
}
