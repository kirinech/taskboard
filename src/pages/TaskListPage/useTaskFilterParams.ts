import { useEffect, useRef, useState } from 'react'
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

  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') ?? '')
  const debouncedSearch = useDebounce(searchInput, 200)
  const prevSearchRef = useRef(debouncedSearch)

  useEffect(() => {
    const searchChanged = debouncedSearch !== prevSearchRef.current
    prevSearchRef.current = debouncedSearch

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (debouncedSearch) {
          next.set('search', debouncedSearch)
        } else {
          next.delete('search')
        }
        if (searchChanged) next.delete('page')
        return next
      },
      { replace: true },
    )
  }, [debouncedSearch, setSearchParams])

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))

  function onPageChange(newPage: number) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (newPage <= 1) {
          next.delete('page')
        } else {
          next.set('page', String(newPage))
        }
        return next
      },
      { replace: true },
    )
  }

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
        next.delete('page')
        return next
      },
      { replace: true },
    )
  }

  const filters: TaskFiltersValue = {
    ...readFilters(searchParams),
    search: searchInput,
  }

  const apiSearch = searchParams.get('search') ?? ''

  return { filters, apiSearch, handleChange, page, onPageChange }
}
