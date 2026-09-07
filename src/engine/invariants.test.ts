import { describe, expect, it } from 'vitest'
import reviewCases from './fixtures/review-cases.json'
import { evaluateBorrower } from './decision'
import { calculateEmi, principalForEmi } from './emi'
import { safeEmi } from './affordability'
import type { BorrowerProfile } from '../types/borrower'

type ReviewProfile = BorrowerProfile & { name: string }
const profiles = reviewCases as ReviewProfile[]

describe('financial invariants across review profiles', () => {
  it.each(profiles)('$name always returns bounded numeric outputs', profile => {
    const result = evaluateBorrower(profile)
    const numericValues = [
      result.likelySanction.amount.min, result.likelySanction.amount.max,
      result.safeBorrowing.amount.min, result.safeBorrowing.amount.max,
      result.recommendedEmi.min, result.recommendedEmi.max,
      result.rate.annualRate.min, result.rate.annualRate.max,
      result.rate.estimatedApr.min, result.rate.estimatedApr.max,
    ]
    expect(numericValues.every(value => Number.isFinite(value) && value >= 0)).toBe(true)
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0)
    expect(result.confidenceScore).toBeLessThanOrEqual(100)
    expect(result.recommendedAmount.min).toBeLessThanOrEqual(result.recommendedAmount.max)
    expect(result.recommendedAmount.max).toBeLessThanOrEqual(profile.requestedAmount)
  })

  it.each(profiles)('$name has monotonic affordability', profile => {
    const baseline = safeEmi(profile)
    const higherIncome = safeEmi({ ...profile, monthlyIncomeMin: profile.monthlyIncomeMin + 10000, monthlyIncomeMax: profile.monthlyIncomeMax + 10000 })
    const higherExpenses = safeEmi({ ...profile, essentialExpenses: (profile.essentialExpenses ?? 0) + 10000 })
    const higherDebt = safeEmi({ ...profile, existingEmis: profile.existingEmis + 10000 })
    expect(higherIncome).toBeGreaterThanOrEqual(baseline)
    expect(higherExpenses).toBeLessThanOrEqual(baseline)
    expect(higherDebt).toBeLessThanOrEqual(baseline)
  })

  it.each(profiles)('$name keeps lender and safe ranges ordered', profile => {
    const result = evaluateBorrower(profile)
    expect(result.likelySanction.amount.min).toBeLessThanOrEqual(result.likelySanction.amount.max)
    expect(result.safeBorrowing.amount.min).toBeLessThanOrEqual(result.safeBorrowing.amount.max)
    expect(result.tenureTradeoffs.map(option => option.amount)).toEqual([...result.tenureTradeoffs.map(option => option.amount)].sort((a, b) => a - b))
    expect(result.tenureTradeoffs.map(option => option.totalRepayment)).toEqual([...result.tenureTradeoffs.map(option => option.totalRepayment)].sort((a, b) => a - b))
  })
})

describe('financial boundary behavior', () => {
  it('allows a stable borrower to take a modest request within the safe range', () => {
    const profile = profiles.find(item => item.name === 'Stable salaried personal need') as BorrowerProfile
    expect(evaluateBorrower(profile).verdict).toBe('borrow')
  })

  it('handles zero-rate, zero-principal, and invalid tenure EMI cases', () => {
    expect(calculateEmi(120000, 0, 12)).toBe(10000)
    expect(calculateEmi(0, 0.12, 12)).toBe(0)
    expect(calculateEmi(120000, 0.12, 0)).toBe(0)
    expect(principalForEmi(10000, 0, 12)).toBe(120000)
  })

  it('does not recommend a positive amount with no income', () => {
    const profile = profiles.find(item => item.name === 'No income edge case')
    expect(profile).toBeDefined()
    expect(evaluateBorrower(profile as BorrowerProfile).recommendedAmount.max).toBe(0)
  })

  it('does not treat unknown credit as a low score', () => {
    const profile = profiles.find(item => item.name === 'Stable salaried personal need') as BorrowerProfile
    const unknown = evaluateBorrower({ ...profile, creditScore: null })
    const low = evaluateBorrower({ ...profile, creditScore: 650 })
    const known = evaluateBorrower(profile)
    expect(unknown.rate.annualRate.max - unknown.rate.annualRate.min).toBeGreaterThan(known.rate.annualRate.max - known.rate.annualRate.min)
    expect(unknown.rate.annualRate.min).toBeLessThan(low.rate.annualRate.min)
  })

  it('changes rate and safe capacity for high volatility without changing requested amount', () => {
    const profile = profiles.find(item => item.name === 'Stable salaried personal need') as BorrowerProfile
    const volatile = evaluateBorrower({ ...profile, incomeType: 'informal', incomeVolatility: 'high' })
    const stable = evaluateBorrower(profile)
    expect(volatile.recommendedEmi.max).toBeLessThan(stable.recommendedEmi.max)
    expect(volatile.rate.annualRate.min).toBeGreaterThan(stable.rate.annualRate.min)
  })

  it('keeps proposed EMI and principal calculations as inverse operations', () => {
    const principal = 450000
    const rate = 0.145
    const tenure = 48
    expect(principalForEmi(calculateEmi(principal, rate, tenure), rate, tenure)).toBeCloseTo(principal, 4)
  })
})

describe('generated profile smoke matrix', () => {
  const generatedProfiles = Array.from({ length: 100 }, (_, index): BorrowerProfile => ({
    loanPurpose: index % 3 === 0 ? 'business' : 'personal',
    loanProduct: index % 3 === 0 ? 'secured-business-loan' : 'personal-loan',
    requestedAmount: 50000 + (index % 20) * 50000,
    monthlyIncomeMin: 15000 + (index % 15) * 7500,
    monthlyIncomeMax: 18000 + (index % 15) * 9000,
    incomeType: index % 4 === 0 ? 'informal' : index % 3 === 0 ? 'self-employed' : 'salaried',
    existingEmis: (index % 8) * 2500,
    essentialExpenses: index % 11 === 0 ? null : 9000 + (index % 10) * 3500,
    age: 21 + (index % 44),
    creditScore: index % 5 === 0 ? null : 640 + (index % 30) * 5,
    dependents: index % 5,
    emergencySavingsMonths: index % 7 === 0 ? null : index % 9,
    recentRepaymentStress: index % 13 === 0 ? true : false,
    incomeYears: index % 6 === 0 ? null : 1 + (index % 12),
    incomeVolatility: index % 4 === 0 ? 'high' : index % 3 === 0 ? 'medium' : 'low',
    documentedIncome: index % 6 === 0 ? null : index % 2 === 0,
    propertyValue: index % 3 === 0 ? 1000000 + index * 10000 : null,
    propertyEncumbered: index % 3 === 0 ? index % 2 === 0 : null,
  }))

  it.each(generatedProfiles)('profile %s produces a result without throwing', profile => {
    const result = evaluateBorrower(profile)
    expect(result.verdict).toMatch(/borrow/)
    expect(Number.isFinite(result.safeBorrowing.amount.max)).toBe(true)
  })
})
