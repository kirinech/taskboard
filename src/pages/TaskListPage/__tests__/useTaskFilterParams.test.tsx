import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useTaskFilterParams } from '../useTaskFilterParams'

function makeWrapper(url = '/') {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
  }
}

describe('useTaskFilterParams', () => {
  it('returns default filter values on an empty URL', () => {
    const { result } = renderHook(() => useTaskFilterParams(), { wrapper: makeWrapper() })

    expect(result.current.filters).toEqual({
      search: '',
      status: '',
      priority: '',
      tagId: '',
      sortField: 'createdAt',
      sortOrder: 'desc',
    })
    expect(result.current.page).toBe(1)
  })

  it('reads all filter values from URL params', () => {
    const { result } = renderHook(() => useTaskFilterParams(), {
      wrapper: makeWrapper('/?status=done&priority=high&sortField=deadline&sortOrder=asc&tagId=abc&page=3'),
    })

    expect(result.current.filters.status).toBe('done')
    expect(result.current.filters.priority).toBe('high')
    expect(result.current.filters.sortField).toBe('deadline')
    expect(result.current.filters.sortOrder).toBe('asc')
    expect(result.current.filters.tagId).toBe('abc')
    expect(result.current.page).toBe(3)
  })

  describe('handleChange', () => {
    it('updates a filter value', () => {
      const { result } = renderHook(() => useTaskFilterParams(), { wrapper: makeWrapper() })

      act(() => { result.current.handleChange('status', 'done') })

      expect(result.current.filters.status).toBe('done')
    })

    it('resets page to 1 when any non-search filter changes', () => {
      const { result } = renderHook(() => useTaskFilterParams(), {
        wrapper: makeWrapper('/?page=3'),
      })
      expect(result.current.page).toBe(3)

      act(() => { result.current.handleChange('status', 'done') })

      expect(result.current.page).toBe(1)
    })

    it('clears a filter param when set to its default value', () => {
      const { result } = renderHook(() => useTaskFilterParams(), {
        wrapper: makeWrapper('/?status=done'),
      })

      act(() => { result.current.handleChange('status', '') })

      expect(result.current.filters.status).toBe('')
    })

    it('updates sortField and sortOrder independently', () => {
      const { result } = renderHook(() => useTaskFilterParams(), { wrapper: makeWrapper() })

      act(() => { result.current.handleChange('sortField', 'deadline') })
      expect(result.current.filters.sortField).toBe('deadline')

      act(() => { result.current.handleChange('sortOrder', 'asc') })
      expect(result.current.filters.sortOrder).toBe('asc')
    })

    it('updates filters.search immediately without affecting the URL', () => {
      const { result } = renderHook(() => useTaskFilterParams(), { wrapper: makeWrapper() })

      act(() => { result.current.handleChange('search', 'hello') })

      expect(result.current.filters.search).toBe('hello')
      expect(result.current.apiSearch).toBe('')
    })
  })

  describe('onPageChange', () => {
    it('sets the page', () => {
      const { result } = renderHook(() => useTaskFilterParams(), { wrapper: makeWrapper() })

      act(() => { result.current.onPageChange(4) })

      expect(result.current.page).toBe(4)
    })

    it('navigating to page 1 removes the page param and returns 1', () => {
      const { result } = renderHook(() => useTaskFilterParams(), {
        wrapper: makeWrapper('/?page=5'),
      })
      expect(result.current.page).toBe(5)

      act(() => { result.current.onPageChange(1) })

      expect(result.current.page).toBe(1)
    })

    it('preserves existing filters when changing page', () => {
      const { result } = renderHook(() => useTaskFilterParams(), {
        wrapper: makeWrapper('/?status=done'),
      })

      act(() => { result.current.onPageChange(2) })

      expect(result.current.page).toBe(2)
      expect(result.current.filters.status).toBe('done')
    })
  })
})
