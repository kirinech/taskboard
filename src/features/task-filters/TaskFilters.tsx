import {
  Button,
  ButtonGroup,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from '@chakra-ui/react'
import type { Tag, TaskPriority, TaskStatus } from '@/shared/types/task'

export interface TaskFiltersValue {
  search: string
  status: TaskStatus | ''
  priority: TaskPriority | ''
  tagId: string
  sortField: 'createdAt' | 'deadline'
  sortOrder: 'asc' | 'desc'
}

interface Props {
  value: TaskFiltersValue
  onChange: <K extends keyof TaskFiltersValue>(key: K, val: TaskFiltersValue[K]) => void
  tags: Tag[]
}

export function TaskFilters({ value, onChange, tags }: Props) {
  return (
    <Flex wrap="wrap" gap={3} mb={6}>
      <InputGroup maxW="260px">
        <InputLeftElement pointerEvents="none" color="gray.400">
          🔍
        </InputLeftElement>
        <Input
          placeholder="Search by title…"
          value={value.search}
          onChange={(e) => onChange('search', e.target.value)}
        />
      </InputGroup>

      <Select
        maxW="160px"
        value={value.status}
        onChange={(e) => onChange('status', e.target.value as TaskStatus | '')}
        placeholder="All statuses"
      >
        <option value="todo">To Do</option>
        <option value="inProgress">In Progress</option>
        <option value="done">Done</option>
      </Select>

      <Select
        maxW="160px"
        value={value.priority}
        onChange={(e) => onChange('priority', e.target.value as TaskPriority | '')}
        placeholder="All priorities"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </Select>

      <Select
        maxW="160px"
        value={value.tagId}
        onChange={(e) => onChange('tagId', e.target.value)}
        placeholder="All tags"
      >
        {tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag.name}
          </option>
        ))}
      </Select>

      <Select
        maxW="160px"
        value={value.sortField}
        onChange={(e) => onChange('sortField', e.target.value as 'createdAt' | 'deadline')}
      >
        <option value="createdAt">Created date</option>
        <option value="deadline">Deadline</option>
      </Select>

      <ButtonGroup isAttached size="md">
        <Button
          variant={value.sortOrder === 'asc' ? 'solid' : 'outline'}
          colorScheme={value.sortOrder === 'asc' ? 'blue' : 'gray'}
          onClick={() => onChange('sortOrder', 'asc')}
        >
          ↑ Asc
        </Button>
        <Button
          variant={value.sortOrder === 'desc' ? 'solid' : 'outline'}
          colorScheme={value.sortOrder === 'desc' ? 'blue' : 'gray'}
          onClick={() => onChange('sortOrder', 'desc')}
        >
          ↓ Desc
        </Button>
      </ButtonGroup>
    </Flex>
  )
}
