export type IncomeType = 'salaried' | 'self-employed' | 'informal'
export type LoanPurpose = 'personal' | 'business' | 'property' | 'vehicle' | 'gold'
export type LoanProduct = 'personal-loan' | 'secured-business-loan' | 'lap' | 'vehicle-loan' | 'gold-loan'

export type Answer<T> = T | null

export interface BorrowerProfile {
  loanPurpose: LoanPurpose
  loanProduct: LoanProduct
  requestedAmount: number
  monthlyIncomeMin: number
  monthlyIncomeMax: number
  incomeType: IncomeType
  existingEmis: number
  essentialExpenses: number | null
  age: number
  creditScore: number | null
  dependents: number
  emergencySavingsMonths: number | null
  recentRepaymentStress: boolean | null
  incomeYears: number | null
  incomeVolatility: 'low' | 'medium' | 'high' | null
  documentedIncome: boolean | null
  propertyValue: number | null
  propertyEncumbered: boolean | null
}

export type InputKey = keyof BorrowerProfile

export const DEFAULT_PROFILE: BorrowerProfile = {
  loanPurpose: 'personal',
  loanProduct: 'personal-loan',
  requestedAmount: 0,
  monthlyIncomeMin: 0,
  monthlyIncomeMax: 0,
  incomeType: 'salaried',
  existingEmis: 0,
  essentialExpenses: null,
  age: 30,
  creditScore: null,
  dependents: 0,
  emergencySavingsMonths: null,
  recentRepaymentStress: null,
  incomeYears: null,
  incomeVolatility: null,
  documentedIncome: null,
  propertyValue: null,
  propertyEncumbered: null,
}
