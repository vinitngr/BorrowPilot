import { describe, expect, it } from 'vitest'
import cases from './fixtures/review-cases.json'
import { evaluateBorrower } from './decision'
import type { BorrowerProfile } from '../types/borrower'

describe('engine review cases', () => {
  it.each(cases)('$name returns a bounded, explainable result', testCase => {
    const result = evaluateBorrower(testCase as BorrowerProfile)
    expect(['borrow', 'borrow-less', 'dont-borrow']).toContain(result.verdict)
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0)
    expect(result.confidenceScore).toBeLessThanOrEqual(100)
    expect(result.rate.annualRate.min).toBeLessThanOrEqual(result.rate.annualRate.max)
    expect(result.safeBorrowing.amount.min).toBeLessThanOrEqual(result.safeBorrowing.amount.max)
    expect(result.tenureTradeoffs.length).toBe(3)
  })

  it('keeps the no-income edge case from producing a positive capacity', () => {
    const noIncome = cases.find(testCase => testCase.name === 'No income edge case')
    expect(noIncome).toBeDefined()
    expect(evaluateBorrower(noIncome as unknown as BorrowerProfile).recommendedAmount.max).toBe(0)
  })
})
