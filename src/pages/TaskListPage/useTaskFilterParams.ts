import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { TaskFiltersValue } from '@/features/task-filters'
import { useDebounce } from '@/shared/hooks/useDebounce'

const DEFAULTS: TaskFiltersValue = {
  search: '',
  status: '',
  priority: '',
  tagId: '',
  sortField: 'createdAt',
  sortOrder: 'desc',
}

function readFilters(params: URLSearchParams): TaskFiltersValue {
  return {
    search: params.get('search') ?? '',
    status: (params.get('status') as TaskFiltersValue['status']) || '',
    priority: (params.get('priority') as TaskFiltersValue['priority']) || '',
    tagId: params.get('tagId') ?? '',
    sortField: (params.get('sortField') as 'createdAt' | 'deadline') || 'createdAt',
    sortOrder: (params.get('sortOrder') as 'asc' | 'desc') || 'desc',
  }
}

export function useTaskFilterParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Search input is kept in local state so the input stays responsive while typing.
  // The debounced value is what gets written to the URL (and drives the API query).
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') ?? '')
  const debouncedSearch = useDebounce(searchInput, 200)

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (debouncedSearch) {
          next.set('search', debouncedSearch)
        } else {
          next.delete('search')
        }
        return next
      },
      { replace: true },
    )
  }, [debouncedSearch, setSearchParams])

  function handleChange<K extends keyof TaskFiltersValue>(key: K, val: TaskFiltersValue[K]) {
    if (key === 'search') {
      setSearchInput(val as string)
      return
    }

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (!val || val === DEFAULTS[key]) {
          next.delete(key)
        } else {
          next.set(key, String(val))
        }
        return next
      },
      { replace: true },
    )
  }

  // Filters shown in the UI — search reflects the live input, not the URL
  const filters: TaskFiltersValue = {
    ...readFilters(searchParams),
    search: searchInput,
  }

  // The search value that drives the API — comes from the URL (i.e. already debounced)
  const apiSearch = searchParams.get('search') ?? ''

  return { filters, apiSearch, handleChange }
}
