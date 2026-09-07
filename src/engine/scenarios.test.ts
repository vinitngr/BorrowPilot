import { describe, expect, it } from 'vitest'
import { evaluateBorrower } from './decision'
import type { BorrowerProfile } from '../types/borrower'

const priya: BorrowerProfile = {
  loanPurpose: 'personal', loanProduct: 'personal-loan', requestedAmount: 900000,
  monthlyIncomeMin: 80000, monthlyIncomeMax: 80000, incomeType: 'salaried', existingEmis: 10000,
  essentialExpenses: 40000, age: 31, creditScore: 760, dependents: 2, emergencySavingsMonths: 4,
  recentRepaymentStress: false, incomeYears: 6, incomeVolatility: 'low', documentedIncome: true,
  propertyValue: null, propertyEncumbered: null,
}

const ravi: BorrowerProfile = {
  loanPurpose: 'business', loanProduct: 'secured-business-loan', requestedAmount: 2500000,
  monthlyIncomeMin: 120000, monthlyIncomeMax: 180000, incomeType: 'self-employed', existingEmis: 20000,
  essentialExpenses: 55000, age: 38, creditScore: 735, dependents: 3, emergencySavingsMonths: 5,
  recentRepaymentStress: false, incomeYears: 9, incomeVolatility: 'medium', documentedIncome: true,
  propertyValue: 5000000, propertyEncumbered: false,
}

const anita: BorrowerProfile = {
  loanPurpose: 'vehicle', loanProduct: 'vehicle-loan', requestedAmount: 150000,
  monthlyIncomeMin: 45000, monthlyIncomeMax: 45000, incomeType: 'informal', existingEmis: 20000,
  essentialExpenses: 22000, age: 29, creditScore: null, dependents: 2, emergencySavingsMonths: 0,
  recentRepaymentStress: true, incomeYears: 2, incomeVolatility: 'high', documentedIncome: false,
  propertyValue: null, propertyEncumbered: null,
}

describe('required borrower scenarios', () => {
  it('keeps Priya eligible while showing a safer amount below lender capacity', () => {
    const result = evaluateBorrower(priya)
    expect(result.verdict).toBe('borrow-less')
    expect(result.safeBorrowing.amount.max).toBeLessThan(result.likelySanction.amount.max)
  })

  it('routes Ravi toward secured business borrowing', () => {
    const result = evaluateBorrower(ravi)
    expect(result.productRecommendation).toBe('secured-business-loan')
    expect(result.positiveFactors.some(factor => factor.includes('property'))).toBe(true)
  })

  it('can recommend not borrowing for Anita under repayment stress', () => {
    const result = evaluateBorrower(anita)
    expect(result.verdict).toBe('dont-borrow')
    expect(result.recommendedAmount.max).toBe(0)
  })
})

describe('uncertainty handling', () => {
  it('widens rate estimates when credit score is unknown', () => {
    const known = evaluateBorrower(priya)
    const unknown = evaluateBorrower({ ...priya, creditScore: null })
    expect(unknown.rate.annualRate.max - unknown.rate.annualRate.min).toBeGreaterThan(known.rate.annualRate.max - known.rate.annualRate.min)
    expect(unknown.confidenceScore).toBeLessThan(known.confidenceScore)
  })

  it('reduces confidence when essential expenses are missing', () => {
    const complete = evaluateBorrower(priya)
    const incomplete = evaluateBorrower({ ...priya, essentialExpenses: null })
    expect(incomplete.confidenceScore).toBeLessThan(complete.confidenceScore)
    expect(incomplete.disposableIncome).toBeNull()
  })
})
