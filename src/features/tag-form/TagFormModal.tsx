import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCreateTagMutation } from '@/entities/tag/api'
import { useGetTagsQuery } from '@/entities/tag/api'

type FormValues = { name: string }

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function TagFormModal({ isOpen, onClose }: Props) {
  const [createTag, { isLoading }] = useCreateTagMutation()
  const { data: existingTags = [] } = useGetTagsQuery()

  const schema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .min(1, 'Tag name is required')
          .max(30, 'Tag name must be 30 characters or fewer')
          .refine(
            (name) =>
              !existingTags.some(
                (t) => t.name.toLowerCase() === name.trim().toLowerCase(),
              ),
            'A tag with this name already exists',
          ),
      }),
    [existingTags],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    await createTag({ name: values.name.trim() })
    reset()
    onClose()
  }

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>Add tag</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <FormControl isInvalid={!!errors.name}>
            <FormLabel>Tag name</FormLabel>
            <Input placeholder="e.g. Frontend" autoFocus {...register('name')} />
            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
          </FormControl>
        </ModalBody>

        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" colorScheme="blue" isLoading={isLoading}>
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
