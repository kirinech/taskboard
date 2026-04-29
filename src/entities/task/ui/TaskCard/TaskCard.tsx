import {
  Badge,
  Box,
  Card,
  CardBody,
  Flex,
  Select,
  Tag as ChakraTag,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import type { ChangeEvent } from 'react'
import { useUpdateTaskStatusMutation } from '@/entities/task/api'
import type { Tag, Task, TaskStatus } from '@/shared/types/task'
import styles from './TaskCard.module.css'

interface Props {
  task: Task
  tags: Tag[]
  onTagClick?: (tag: Tag) => void
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'inProgress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

const STATUS_COLOR: Record<TaskStatus, string> = {
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

export function TaskCard({ task, tags, onTagClick }: Props) {
  const [updateStatus, { isLoading }] = useUpdateTaskStatusMutation()
  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'done'
  const color = STATUS_COLOR[task.status]

  function handleStatusChange(e: ChangeEvent<HTMLSelectElement>) {
    updateStatus({ id: task.id, status: e.target.value as TaskStatus })
  }

  return (
    <Card className={isOverdue ? styles.overdue : undefined} h="full">
      <CardBody display="flex" flexDirection="column" gap={3}>
        <Flex justify="space-between" align="center">
          <Badge colorScheme={PRIORITY_COLOR[task.priority]}>
            {PRIORITY_LABEL[task.priority]}
          </Badge>

          <Box
            bg={`${color}.100`}
            color={`${color}.800`}
            borderRadius="full"
            px={2}
            py="1px"
            opacity={isLoading ? 0.6 : 1}
            transition="opacity 0.15s"
          >
            <Select
              variant="unstyled"
              size="xs"
              value={task.status}
              onChange={handleStatusChange}
              isDisabled={isLoading}
              fontWeight="bold"
              fontSize="xs"
              cursor="pointer"
              onClick={(e) => e.stopPropagation()}
            >
              {STATUS_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Box>
        </Flex>

        <Text fontWeight="semibold" fontSize="md" lineHeight="short">
          {task.title}
        </Text>

        {task.description && (
          <Text color="gray.500" fontSize="sm" noOfLines={2} flex={1}>
            {task.description}
          </Text>
        )}

        <Text
          fontSize="xs"
          color={isOverdue ? 'red.500' : 'gray.400'}
          fontWeight={isOverdue ? 'semibold' : 'normal'}
        >
          📅 {new Date(task.deadline).toLocaleDateString()}
          {isOverdue && ' — Overdue'}
        </Text>

        {tags.length > 0 && (
          <Wrap spacing={1}>
            {tags.map((tag) => (
              <WrapItem key={tag.id}>
                <ChakraTag
                  size="sm"
                  variant="subtle"
                  colorScheme="purple"
                  cursor={onTagClick ? 'pointer' : 'default'}
                  onClick={onTagClick ? (e) => { e.stopPropagation(); onTagClick(tag) } : undefined}
                  _hover={onTagClick ? { opacity: 0.75 } : undefined}
                >
                  {tag.name}
                </ChakraTag>
              </WrapItem>
            ))}
          </Wrap>
        )}
      </CardBody>
    </Card>
  )
}
