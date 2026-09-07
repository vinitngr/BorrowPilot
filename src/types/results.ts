import type { LoanProduct } from './borrower'

export type Verdict = 'borrow' | 'borrow-less' | 'dont-borrow'
export type Confidence = 'low' | 'medium' | 'high'

export interface MoneyRange {
  min: number
  max: number
}

export interface LoanEstimate {
  amount: MoneyRange
  monthlyEmi: MoneyRange
  tenureMonths: number
}

export interface TenureTradeoff {
  tenureMonths: number
  amount: number
  monthlyEmi: number
  totalRepayment: number
}

export interface RateEstimate {
  annualRate: MoneyRange
  estimatedApr: MoneyRange
  processingFee: MoneyRange
}

export interface StressScenario {
  label: string
  monthlyIncome: number
  safeEmi: number
  remainingAfterEmi: number
  passes: boolean
}

export interface BorrowerResult {
  verdict: Verdict
  verdictExplanation: string
  likelySanction: LoanEstimate
  safeBorrowing: LoanEstimate
  recommendedAmount: MoneyRange
  recommendedEmi: MoneyRange
  rate: RateEstimate
  debtBurden: number
  disposableIncome: number | null
  confidence: Confidence
  confidenceScore: number
  positiveFactors: string[]
  riskFactors: string[]
  productRecommendation: LoanProduct
  stressScenario: StressScenario
  tenureTradeoffs: TenureTradeoff[]
  reasons: string[]
}
