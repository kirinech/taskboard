import {
  Box,
  Input,
  List,
  ListItem,
  Portal,
  Tag as ChakraTag,
  TagCloseButton,
  TagLabel,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { useCreateTagMutation } from '@/entities/tag/api'
import type { Tag } from '@/shared/types/task'

interface Props {
  value: string[]
  onChange: (ids: string[]) => void
  tags: Tag[]
  isInvalid?: boolean
}

interface DropdownCoords {
  top: number
  left: number
  width: number
}

export function TagsAutocomplete({ value, onChange, tags, isInvalid }: Props) {
  const [input, setInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState<DropdownCoords>({ top: 0, left: 0, width: 0 })
  const [createTag, { isLoading: isCreating }] = useCreateTagMutation()
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedTags = value
    .map((id) => tags.find((t) => t.id === id))
    .filter((t): t is Tag => Boolean(t))

  const trimmed = input.trim().toLowerCase()

  const filtered = tags.filter(
    (t) => t.name.toLowerCase().includes(trimmed) && !value.includes(t.id),
  )

  const exactMatch = tags.some((t) => t.name.toLowerCase() === trimmed)
  const canCreate = trimmed.length > 0 && !exactMatch
  const showDropdown = isOpen && (filtered.length > 0 || canCreate)

  // Recalculate the fixed position every time the dropdown becomes visible
  // so it always aligns with the input even after the Wrap grows/shrinks.
  useLayoutEffect(() => {
    if (!showDropdown || !inputRef.current) return
    const rect = inputRef.current.getBoundingClientRect()
    setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width })
  }, [showDropdown, selectedTags.length])

  function select(id: string) {
    onChange([...value, id])
    setInput('')
    inputRef.current?.focus()
  }

  function remove(id: string) {
    onChange(value.filter((v) => v !== id))
  }

  async function handleCreate() {
    const created = await createTag({ name: input.trim() }).unwrap()
    onChange([...value, created.id])
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <Box>
      {selectedTags.length > 0 && (
        <Wrap spacing={1} mb={2}>
          {selectedTags.map((tag) => (
            <WrapItem key={tag.id}>
              <ChakraTag colorScheme="purple" size="sm">
                <TagLabel>{tag.name}</TagLabel>
                <TagCloseButton onClick={() => remove(tag.id)} />
              </ChakraTag>
            </WrapItem>
          ))}
        </Wrap>
      )}

      <Input
        ref={inputRef}
        value={input}
        onChange={(e) => { setInput(e.target.value); setIsOpen(true) }}
        onFocus={() => setIsOpen(true)}
        // Delay closing so onClick on portal items fires before the dropdown unmounts
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder="Search or create tags…"
        isInvalid={isInvalid}
      />

      {showDropdown && (
        <Portal>
          <Box
            position="fixed"
            top={`${coords.top}px`}
            left={`${coords.left}px`}
            w={`${coords.width}px`}
            zIndex={1500}
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            boxShadow="md"
            maxH="200px"
            overflowY="auto"
          >
            <List>
              {filtered.map((tag) => (
                <ListItem
                  key={tag.id}
                  px={3}
                  py={2}
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                  // preventDefault keeps focus on the input so onBlur doesn't fire
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => select(tag.id)}
                >
                  {tag.name}
                </ListItem>
              ))}

              {canCreate && (
                <ListItem
                  px={3}
                  py={2}
                  cursor="pointer"
                  color="blue.500"
                  fontWeight="medium"
                  _hover={{ bg: 'blue.50' }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { if (!isCreating) handleCreate() }}
                >
                  {isCreating ? 'Creating…' : `+ Create "${input.trim()}"`}
                </ListItem>
              )}
            </List>
          </Box>
        </Portal>
      )}
    </Box>
  )
}
