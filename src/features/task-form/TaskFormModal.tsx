import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Select,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useGetTagsQuery } from '@/entities/tag/api'
import { useCreateTaskMutation, useUpdateTaskMutation } from '@/entities/task/api'
import type { Task } from '@/shared/types/task'
import { TagsAutocomplete } from './ui/TagsAutocomplete'

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().max(500, 'Description must be 500 characters or fewer').optional(),
  status: z.enum(['todo', 'inProgress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  deadline: z.string().min(1, 'Deadline is required'),
  tags: z.array(z.string()).min(1, 'At least 1 tag is required'),
})

type FormValues = z.infer<typeof schema>

const CREATE_DEFAULTS: FormValues = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  deadline: '',
  tags: [],
}

interface Props {
  isOpen: boolean
  onClose: () => void
  task?: Task
}

export function TaskFormModal({ isOpen, onClose, task }: Props) {
  const isEditMode = Boolean(task)
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation()
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation()
  const { data: tags = [] } = useGetTagsQuery()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!isOpen) return
    reset(
      task
        ? {
            title: task.title,
            description: task.description ?? '',
            status: task.status,
            priority: task.priority,
            deadline: task.deadline,
            tags: task.tags,
          }
        : CREATE_DEFAULTS,
    )
  }, [isOpen, task, reset])

  async function onSubmit(values: FormValues) {
    if (task) {
      await updateTask({
        id: task.id,
        body: { ...values, createdAt: task.createdAt },
      })
    } else {
      await createTask(values)
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>{isEditMode ? 'Edit task' : 'Add task'}</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={5} align="stretch">
            <FormControl isInvalid={!!errors.title}>
              <FormLabel>Title</FormLabel>
              <Input placeholder="Task title…" {...register('title')} />
              <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.description}>
              <FormLabel>
                Description{' '}
                <span style={{ color: 'gray', fontWeight: 400 }}>(optional)</span>
              </FormLabel>
              <Textarea placeholder="Optional description…" rows={3} resize="vertical" {...register('description')} />
              <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.status}>
              <FormLabel>Status</FormLabel>
              <Select {...register('status')}>
                <option value="todo">To Do</option>
                <option value="inProgress">In Progress</option>
                <option value="done">Done</option>
              </Select>
              <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.priority}>
              <FormLabel>Priority</FormLabel>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <RadioGroup value={field.value} onChange={field.onChange}>
                    <HStack spacing={6}>
                      <Radio value="low" colorScheme="green">Low</Radio>
                      <Radio value="medium" colorScheme="orange">Medium</Radio>
                      <Radio value="high" colorScheme="red">High</Radio>
                    </HStack>
                  </RadioGroup>
                )}
              />
              <FormErrorMessage>{errors.priority?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.deadline}>
              <FormLabel>Deadline</FormLabel>
              <Input type="date" {...register('deadline')} />
              <FormErrorMessage>{errors.deadline?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.tags}>
              <FormLabel>Tags</FormLabel>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <TagsAutocomplete
                    value={field.value}
                    onChange={field.onChange}
                    tags={tags}
                    isInvalid={!!errors.tags}
                  />
                )}
              />
              <FormErrorMessage>{errors.tags?.message}</FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" colorScheme="blue" isLoading={isCreating || isUpdating}>
            {isEditMode ? 'Save changes' : 'Create task'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
