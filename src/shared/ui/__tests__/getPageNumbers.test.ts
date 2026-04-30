import { describe, expect, it } from 'vitest'
import { getPageNumbers } from '../getPageNumbers'

describe('getPageNumbers', () => {
  describe('when total <= 7', () => {
    it('returns every page for total = 1', () => {
      expect(getPageNumbers(1, 1)).toEqual([1])
    })

    it('returns every page for total = 7', () => {
      expect(getPageNumbers(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('is not affected by which page is current', () => {
      expect(getPageNumbers(7, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
    })
  })

  describe('when total > 7', () => {
    it('shows no leading ellipsis when current <= 3', () => {
      expect(getPageNumbers(1, 10)).toEqual([1, 2, '…', 10])
      expect(getPageNumbers(2, 10)).toEqual([1, 2, 3, '…', 10])
      expect(getPageNumbers(3, 10)).toEqual([1, 2, 3, 4, '…', 10])
    })

    it('shows leading ellipsis when current > 3', () => {
      expect(getPageNumbers(4, 10)).toEqual([1, '…', 3, 4, 5, '…', 10])
      expect(getPageNumbers(5, 10)).toEqual([1, '…', 4, 5, 6, '…', 10])
    })

    it('shows no trailing ellipsis when current >= total - 2', () => {
      expect(getPageNumbers(10, 10)).toEqual([1, '…', 9, 10])
      expect(getPageNumbers(9, 10)).toEqual([1, '…', 8, 9, 10])
      expect(getPageNumbers(8, 10)).toEqual([1, '…', 7, 8, 9, 10])
    })

    it('shows trailing ellipsis when current < total - 2', () => {
      expect(getPageNumbers(7, 10)).toEqual([1, '…', 6, 7, 8, '…', 10])
    })

    it('shows both ellipses in the middle', () => {
      expect(getPageNumbers(5, 20)).toEqual([1, '…', 4, 5, 6, '…', 20])
    })

    it('always includes page 1 and the last page', () => {
      const result = getPageNumbers(10, 20)
      expect(result[0]).toBe(1)
      expect(result[result.length - 1]).toBe(20)
    })
  })
})
