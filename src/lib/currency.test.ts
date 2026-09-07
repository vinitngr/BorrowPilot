import { describe, expect, it } from 'vitest'
import { formatMoney, fromInr, profileToInr, toInr } from './currency'
import type { BorrowerProfile } from '../types/borrower'

describe('display currency boundary', () => {
  it('round trips display amounts through the fixed conversion table', () => {
    expect(fromInr(toInr(1000, 'USD'), 'USD')).toBe(1000)
    expect(fromInr(toInr(1000, 'AED'), 'AED')).toBe(1000)
  })

  it('formats INR-calibrated values in the selected display currency', () => {
    expect(formatMoney(84000, 'USD')).toContain('$1,000')
    expect(formatMoney(84000, 'INR')).toContain('84,000')
  })

  it('converts all monetary profile fields while preserving domain fields', () => {
    const profile = { requestedAmount: 1000, monthlyIncomeMin: 2000, monthlyIncomeMax: 3000, existingEmis: 100, essentialExpenses: 500, propertyValue: null, age: 30 } as unknown as BorrowerProfile
    const converted = profileToInr(profile, 'USD')
    expect(converted.requestedAmount).toBe(84000)
    expect(converted.monthlyIncomeMax).toBe(252000)
    expect(converted.age).toBe(30)
  })
})
