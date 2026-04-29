import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  HStack,
  Heading,
  SimpleGrid,
  Spinner,
  Tag as ChakraTag,
  Text,
  Wrap,
  WrapItem,
  useDisclosure,
} from '@chakra-ui/react'
import { useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetTagsQuery } from '@/entities/tag/api'
import { useDeleteTaskMutation, useGetTaskByIdQuery } from '@/entities/task/api'
import { TaskFormModal } from '@/features/task-form'
import type { Tag, Task } from '@/shared/types/task'

const STATUS_LABEL: Record<Task['status'], string> = {
  todo: 'To Do',
  inProgress: 'In Progress',
  done: 'Done',
}
const STATUS_COLOR: Record<Task['status'], string> = {
  todo: 'gray',
  inProgress: 'blue',
  done: 'green',
}
const PRIORITY_LABEL: Record<Task['priority'], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}
const PRIORITY_COLOR: Record<Task['priority'], string> = {
  low: 'green',
  medium: 'orange',
  high: 'red',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" mb={1}>
        {label}
      </Text>
      {children}
    </Box>
  )
}

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const deleteDialog = useDisclosure()
  const editModal = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)

  const { data: task, isLoading, isError } = useGetTaskByIdQuery(id!)
  const { data: tags = [] } = useGetTagsQuery()
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation()

  const tagMap = Object.fromEntries(tags.map((t) => [t.id, t]))

  async function handleDelete() {
    await deleteTask(id!)
    navigate('/')
  }

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (isError || !task) {
    return (
      <Center h="100vh">
        <Text color="red.500">Task not found.</Text>
      </Center>
    )
  }

  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'done'
  const resolvedTags = task.tags
    .map((tagId) => tagMap[tagId])
    .filter((t): t is Tag => Boolean(t))

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <Button variant="ghost" onClick={() => navigate('/')} mb={4} pl={0}>
        ← Back
      </Button>

      <Flex justify="space-between" align="flex-start" mb={6} gap={4}>
        <Heading size="lg">{task.title}</Heading>
        <HStack flexShrink={0}>
          <Button colorScheme="blue" onClick={editModal.onOpen}>Edit</Button>
          <Button colorScheme="red" onClick={deleteDialog.onOpen}>Delete</Button>
        </HStack>
      </Flex>

      <Divider mb={6} />

      <SimpleGrid maxW="800px" columns={{ base: 1, sm: 2 }} spacing={6} mb={6}>
        <Field label="Status">
          <Badge colorScheme={STATUS_COLOR[task.status]} fontSize="sm">
            {STATUS_LABEL[task.status]}
          </Badge>
        </Field>

        <Field label="Priority">
          <Badge colorScheme={PRIORITY_COLOR[task.priority]} fontSize="sm">
            {PRIORITY_LABEL[task.priority]}
          </Badge>
        </Field>

        <Field label="Deadline">
          <Text color={isOverdue ? 'red.500' : 'inherit'} fontWeight={isOverdue ? 'semibold' : 'normal'}>
            {new Date(task.deadline).toLocaleDateString()}
            {isOverdue && ' — Overdue'}
          </Text>
        </Field>

        <Field label="Tags">
          {resolvedTags.length > 0 ? (
            <Wrap spacing={1}>
              {resolvedTags.map((tag) => (
                <WrapItem key={tag.id}>
                  <ChakraTag size="sm" variant="subtle" colorScheme="purple">
                    {tag.name}
                  </ChakraTag>
                </WrapItem>
              ))}
            </Wrap>
          ) : (
            <Text color="gray.400">—</Text>
          )}
        </Field>

        <Field label="Created">
          <Text>{new Date(task.createdAt).toLocaleString()}</Text>
        </Field>

        <Field label="Last updated">
          <Text>{new Date(task.updatedAt).toLocaleString()}</Text>
        </Field>
      </SimpleGrid>

      {task.description && (
        <>
          <Divider mb={6} />
          <Field label="Description">
            <Text whiteSpace="pre-wrap" mt={1}>{task.description}</Text>
          </Field>
        </>
      )}

      <TaskFormModal isOpen={editModal.isOpen} onClose={editModal.onClose} task={task} />

      <AlertDialog isOpen={deleteDialog.isOpen} leastDestructiveRef={cancelRef} onClose={deleteDialog.onClose} isCentered>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Delete task</AlertDialogHeader>
          <AlertDialogBody>
            Are you sure you want to delete &ldquo;{task.title}&rdquo;? This action cannot be undone.
          </AlertDialogBody>
          <AlertDialogFooter gap={2}>
            <Button ref={cancelRef} onClick={deleteDialog.onClose}>Cancel</Button>
            <Button colorScheme="red" isLoading={isDeleting} onClick={handleDelete}>Delete</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  )
}
