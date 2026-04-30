import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from '../Pagination'

function renderPagination(props: { page: number; totalPages: number; onChange?: () => void }) {
  const onChange = props.onChange ?? vi.fn()
  render(
    <ChakraProvider>
      <Pagination page={props.page} totalPages={props.totalPages} onChange={onChange} />
    </ChakraProvider>,
  )
  return { onChange }
}

describe('Pagination', () => {
  it('renders nothing when totalPages is 1', () => {
    render(
      <ChakraProvider>
        <Pagination page={1} totalPages={1} onChange={vi.fn()} />
      </ChakraProvider>,
    )
    expect(screen.queryByRole('button', { name: '←' })).not.toBeInTheDocument()
  })

  it('renders nothing when totalPages is 0', () => {
    render(
      <ChakraProvider>
        <Pagination page={1} totalPages={0} onChange={vi.fn()} />
      </ChakraProvider>,
    )
    expect(screen.queryByRole('button', { name: '←' })).not.toBeInTheDocument()
  })

  it('renders prev, page buttons and next', () => {
    renderPagination({ page: 1, totalPages: 3 })

    expect(screen.getByRole('button', { name: '←' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '→' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()
  })

  it('disables the prev button on the first page', () => {
    renderPagination({ page: 1, totalPages: 5 })
    expect(screen.getByRole('button', { name: '←' })).toBeDisabled()
  })

  it('disables the next button on the last page', () => {
    renderPagination({ page: 5, totalPages: 5 })
    expect(screen.getByRole('button', { name: '→' })).toBeDisabled()
  })

  it('enables both prev and next on a middle page', () => {
    renderPagination({ page: 3, totalPages: 5 })
    expect(screen.getByRole('button', { name: '←' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: '→' })).not.toBeDisabled()
  })

  it('calls onChange with page - 1 when prev is clicked', async () => {
    const onChange = vi.fn()
    renderPagination({ page: 3, totalPages: 5, onChange })
    await userEvent.click(screen.getByRole('button', { name: '←' }))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('calls onChange with page + 1 when next is clicked', async () => {
    const onChange = vi.fn()
    renderPagination({ page: 3, totalPages: 5, onChange })
    await userEvent.click(screen.getByRole('button', { name: '→' }))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('calls onChange with the correct page number when a page button is clicked', async () => {
    const onChange = vi.fn()
    renderPagination({ page: 1, totalPages: 5, onChange })
    await userEvent.click(screen.getByRole('button', { name: '4' }))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('renders ellipsis for large page counts', () => {
    renderPagination({ page: 5, totalPages: 20 })
    const ellipses = screen.getAllByText('…')
    expect(ellipses).toHaveLength(2)
  })

  it('does not call onChange when prev is clicked on page 1', async () => {
    const onChange = vi.fn()
    renderPagination({ page: 1, totalPages: 3, onChange })
    await userEvent.click(screen.getByRole('button', { name: '←' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not call onChange when next is clicked on the last page', async () => {
    const onChange = vi.fn()
    renderPagination({ page: 3, totalPages: 3, onChange })
    await userEvent.click(screen.getByRole('button', { name: '→' }))
    expect(onChange).not.toHaveBeenCalled()
  })
})
