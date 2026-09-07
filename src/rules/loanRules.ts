import type { IncomeType, LoanProduct } from '../types/borrower'

export const LOAN_RULES = {
  baseFoir: 0.5,
  salariedFoir: 0.55,
  selfEmployedFoir: 0.5,
  informalFoir: 0.42,
  safeFoir: 0.4,
  minimumLivingCostPerDependent: 5000,
  defaultProcessingFeeRate: 0.02,
  stressIncomeDrop: 0.2,
  ageAtMaturity: 65,
  defaultTenureMonths: 48,
  minRateByProduct: {
    'personal-loan': 0.12,
    'secured-business-loan': 0.11,
    lap: 0.095,
    'vehicle-loan': 0.105,
    'gold-loan': 0.1,
  } satisfies Record<LoanProduct, number>,
} as const

export function lenderFoirFor(incomeType: IncomeType, product: LoanProduct): number {
  if (product === 'lap' || product === 'secured-business-loan') return 0.55
  if (incomeType === 'salaried') return LOAN_RULES.salariedFoir
  if (incomeType === 'self-employed') return LOAN_RULES.selfEmployedFoir
  return LOAN_RULES.informalFoir
}
