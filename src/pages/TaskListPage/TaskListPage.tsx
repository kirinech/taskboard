import { Box, Button, Center, Flex, Heading, SimpleGrid, Spinner, Text, useDisclosure } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useGetTagsQuery } from '@/entities/tag/api'
import { useGetTasksQuery } from '@/entities/task/api'
import { TaskCard } from '@/entities/task/ui/TaskCard'
import { TaskFilters } from '@/features/task-filters'
import { TagFormModal } from '@/features/tag-form'
import type { Tag } from '@/shared/types/task'
import { useTaskFilterParams } from './useTaskFilterParams'

export function TaskListPage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const navigate = useNavigate()
  const { filters, apiSearch, handleChange } = useTaskFilterParams()

  const { data: tasksData, isLoading, isError } = useGetTasksQuery({
    ...(apiSearch && { title_like: apiSearch }),
    ...(filters.status && { status: filters.status }),
    ...(filters.priority && { priority: filters.priority }),
    ...(filters.tagId && { tags: filters.tagId }),
    _sort: filters.sortField,
    _order: filters.sortOrder,
  })

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
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Tasks</Heading>
        <Button colorScheme="teal" onClick={onOpen}>+ Add tag</Button>
      </Flex>

      <TagFormModal isOpen={isOpen} onClose={onClose} />

      <TaskFilters value={filters} onChange={handleChange} tags={tags} />

      {tasks.length === 0 ? (
        <Text color="gray.500">No tasks match the current filters.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              tags={task.tags
                .map((id) => tagMap[id])
                .filter((t): t is Tag => Boolean(t))}
              onTagClick={(tag) => handleChange('tagId', tag.id)}
              onClick={() => navigate(`/tasks/${task.id}`)}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  )
}
