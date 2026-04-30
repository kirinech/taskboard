import { Button, HStack, Text } from '@chakra-ui/react'

interface Props {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

function getPageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '…')[] = [1]
  if (current > 3) pages.push('…')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p)
  }
  if (current < total - 2) pages.push('…')
  pages.push(total)

  return pages
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
