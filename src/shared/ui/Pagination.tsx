import { Button, HStack, Text } from '@chakra-ui/react'
import { getPageNumbers } from './getPageNumbers'

interface Props {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null

  return (
    <HStack justify="center" spacing={1} mt={6}>
      <Button
        size="sm"
        variant="ghost"
        isDisabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        ←
      </Button>

      {getPageNumbers(page, totalPages).map((p, i) =>
        p === '…' ? (
          <Text key={`gap-${i}`} px={1} color="gray.400" userSelect="none">
            …
          </Text>
        ) : (
          <Button
            key={p}
            size="sm"
            minW={8}
            variant={p === page ? 'solid' : 'ghost'}
            colorScheme={p === page ? 'blue' : 'gray'}
            onClick={() => onChange(p)}
          >
            {p}
          </Button>
        ),
      )}

      <Button
        size="sm"
        variant="ghost"
        isDisabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        →
      </Button>
    </HStack>
  )
}
