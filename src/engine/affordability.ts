import { calculateEmi, principalForEmi } from './emi'
import { lenderFoirFor, LOAN_RULES } from '../rules/loanRules'
import type { BorrowerProfile } from '../types/borrower'

export function averageIncome(profile: BorrowerProfile): number {
  return (profile.monthlyIncomeMin + profile.monthlyIncomeMax) / 2
}

export function incomeWidth(profile: BorrowerProfile): number {
  if (profile.monthlyIncomeMax <= 0) return 1
  return Math.max(0, (profile.monthlyIncomeMax - profile.monthlyIncomeMin) / profile.monthlyIncomeMax)
}

export function debtBurden(profile: BorrowerProfile, proposedEmi = 0): number {
  const income = averageIncome(profile)
  return income > 0 ? (profile.existingEmis + proposedEmi) / income : 1
}

export function safeEmi(profile: BorrowerProfile): number {
  const income = profile.monthlyIncomeMin || averageIncome(profile)
  const knownExpenses = profile.essentialExpenses ?? income * 0.5
  const minimumLiving = profile.dependents * LOAN_RULES.minimumLivingCostPerDependent
  let capacity = income * LOAN_RULES.safeFoir - profile.existingEmis
  capacity = Math.min(capacity, income - knownExpenses - minimumLiving - profile.existingEmis)
  if (profile.incomeVolatility === 'high' || profile.incomeType === 'informal') capacity *= 0.8
  if (profile.incomeVolatility === 'medium') capacity *= 0.9
  if (profile.emergencySavingsMonths !== null && profile.emergencySavingsMonths < 3) capacity *= 0.85
  if (profile.recentRepaymentStress === true) capacity *= 0.65
  return Math.max(0, Math.floor(capacity))
}

export function lenderEmiCapacity(profile: BorrowerProfile): number {
  return Math.max(0, averageIncome(profile) * lenderFoirFor(profile.incomeType, profile.loanProduct) - profile.existingEmis)
}

export function safePrincipal(profile: BorrowerProfile, annualRate: number, tenureMonths: number): number {
  return principalForEmi(safeEmi(profile), annualRate, tenureMonths)
}

export function lenderPrincipal(profile: BorrowerProfile, annualRate: number, tenureMonths: number): number {
  return principalForEmi(lenderEmiCapacity(profile), annualRate, tenureMonths)
}

export function stressIncome(profile: BorrowerProfile): number {
  return averageIncome(profile) * (1 - LOAN_RULES.stressIncomeDrop)
}

export function stressSafeEmi(profile: BorrowerProfile): number {
  return safeEmi({ ...profile, monthlyIncomeMin: stressIncome(profile), monthlyIncomeMax: stressIncome(profile) })
}

export function proposedEmi(profile: BorrowerProfile, annualRate: number): number {
  return calculateEmi(profile.requestedAmount, annualRate, LOAN_RULES.defaultTenureMonths)
}
