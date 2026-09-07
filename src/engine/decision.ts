import { LOAN_RULES } from '../rules/loanRules'
import type { BorrowerProfile } from '../types/borrower'
import type { BorrowerResult, Confidence, MoneyRange, Verdict } from '../types/results'
import { averageIncome, debtBurden, lenderEmiCapacity, lenderPrincipal, safeEmi, safePrincipal, stressIncome, stressSafeEmi } from './affordability'
import { calculateEmi } from './emi'

const round = (value: number) => Math.max(0, Math.round(value / 100) * 100)
const range = (value: number, spread: number): MoneyRange => ({ min: round(value * (1 - spread)), max: round(value * (1 + spread)) })

function rateBand(profile: BorrowerProfile): { annualRate: MoneyRange; estimatedApr: MoneyRange; processingFee: MoneyRange } {
  let floor = LOAN_RULES.minRateByProduct[profile.loanProduct]
  let spread = 0.025
  if (profile.creditScore === null) spread += 0.025
  else if (profile.creditScore < 700) floor += 0.035
  else if (profile.creditScore >= 750) floor -= 0.01
  if (profile.incomeType !== 'salaried') spread += 0.015
  if (profile.incomeVolatility === 'high') floor += 0.02
  const annualRate = { min: Math.max(0.08, floor), max: floor + spread }
  const processingFee = range(profile.requestedAmount * LOAN_RULES.defaultProcessingFeeRate, 0.15)
  const aprAdjustment = profile.requestedAmount > 0 ? processingFee.max / profile.requestedAmount : 0.02
  return { annualRate, processingFee, estimatedApr: { min: annualRate.min + aprAdjustment / 2, max: annualRate.max + aprAdjustment } }
}

function confidence(profile: BorrowerProfile): { score: number; level: Confidence } {
  let score = 100
  if (profile.essentialExpenses === null) score -= 20
  if (profile.creditScore === null) score -= 12
  if (profile.emergencySavingsMonths === null) score -= 10
  if (profile.incomeYears === null) score -= 8
  if (profile.incomeVolatility === null) score -= 8
  if (profile.incomeType !== 'salaried' && profile.documentedIncome === null) score -= 8
  if (profile.monthlyIncomeMin === profile.monthlyIncomeMax) score += 3
  const level: Confidence = score >= 75 ? 'high' : score >= 55 ? 'medium' : 'low'
  return { score: Math.max(0, Math.min(100, score)), level }
}

function chooseVerdict(profile: BorrowerProfile, safeAmount: number, safeEmiValue: number, stressEmi: number): { verdict: Verdict; explanation: string } {
  if (safeEmiValue <= 0 || profile.recentRepaymentStress === true && profile.existingEmis >= averageIncome(profile) * 0.35) {
    return { verdict: 'dont-borrow', explanation: 'Your current obligations leave too little resilient monthly capacity for a new repayment.' }
  }
  if (profile.requestedAmount > safeAmount * 1.15 || stressEmi < safeEmiValue * 0.75) {
    return { verdict: 'borrow-less', explanation: 'A smaller loan keeps the repayment closer to what your budget can safely absorb, including a stress scenario.' }
  }
  return { verdict: 'borrow', explanation: 'The requested borrowing fits within the current affordability and repayment-resilience checks.' }
}

export function evaluateBorrower(profile: BorrowerProfile): BorrowerResult {
  const rate = rateBand(profile)
  const tenure = Math.min(LOAN_RULES.defaultTenureMonths, Math.max(12, (LOAN_RULES.ageAtMaturity - profile.age) * 12))
  const lenderAmount = lenderPrincipal(profile, rate.annualRate.max, tenure)
  const safeAmount = safePrincipal(profile, rate.annualRate.max, tenure)
  const safeEmiValue = safeEmi(profile)
  const stressEmi = stressSafeEmi(profile)
  const decision = chooseVerdict(profile, safeAmount, safeEmiValue, stressEmi)
  const confidenceResult = confidence(profile)
  const sanctionSpread = confidenceResult.level === 'high' ? 0.08 : confidenceResult.level === 'medium' ? 0.15 : 0.25
  const safeSpread = confidenceResult.level === 'high' ? 0.08 : confidenceResult.level === 'medium' ? 0.12 : 0.2
  const likelyMonthly = calculateEmi(lenderAmount, rate.annualRate.max, tenure)
  const safeMonthly = calculateEmi(safeAmount, rate.annualRate.max, tenure)
  const safeRange = range(safeAmount, safeSpread)
  const reasons: string[] = []
  if (profile.existingEmis > 0) reasons.push(`Existing EMIs already use ${Math.round(debtBurden(profile) * 100)}% of average monthly income.`)
  if (profile.essentialExpenses === null) reasons.push('Essential expenses are unknown, so the safe estimate is intentionally less precise.')
  if (profile.creditScore === null) reasons.push('Credit score is unknown, so the fair-rate band is wider.')
  if (profile.recentRepaymentStress) reasons.push('Recent repayment stress is treated as a meaningful warning sign.')
  const positiveFactors: string[] = []
  if (profile.creditScore !== null && profile.creditScore >= 750) positiveFactors.push('Strong reported credit score supports better pricing.')
  if (profile.emergencySavingsMonths !== null && profile.emergencySavingsMonths >= 3) positiveFactors.push('Emergency savings provide repayment resilience.')
  if (profile.incomeType === 'salaried') positiveFactors.push('Salaried income is generally easier for lenders to verify.')
  const riskFactors: string[] = []
  if (profile.incomeVolatility === 'high' || profile.incomeType === 'informal') riskFactors.push('Income volatility calls for a more conservative safe EMI.')
  if (profile.dependents >= 3) riskFactors.push('Several dependents reduce flexible monthly capacity.')
  if (profile.propertyValue && profile.propertyEncumbered === false && (profile.loanProduct === 'lap' || profile.loanProduct === 'secured-business-loan')) positiveFactors.push('Unencumbered property may support a secured borrowing route.')
  return {
    verdict: decision.verdict,
    verdictExplanation: decision.explanation,
    likelySanction: { amount: range(lenderAmount, sanctionSpread), monthlyEmi: range(likelyMonthly, sanctionSpread), tenureMonths: tenure },
    safeBorrowing: { amount: safeRange, monthlyEmi: range(safeMonthly, safeSpread), tenureMonths: tenure },
    recommendedAmount: decision.verdict === 'dont-borrow' ? { min: 0, max: 0 } : { min: round(Math.min(profile.requestedAmount, safeRange.min)), max: round(Math.min(profile.requestedAmount, safeRange.max)) },
    recommendedEmi: { min: round(safeEmiValue * 0.9), max: round(safeEmiValue) },
    rate,
    debtBurden: debtBurden(profile),
    disposableIncome: profile.essentialExpenses === null ? null : averageIncome(profile) - profile.essentialExpenses - profile.existingEmis,
    confidence: confidenceResult.level,
    confidenceScore: confidenceResult.score,
    positiveFactors,
    riskFactors,
    productRecommendation: profile.propertyValue && profile.propertyEncumbered === false && profile.incomeType === 'self-employed' ? 'secured-business-loan' : profile.loanProduct,
    stressScenario: { label: 'Income falls by 20%', monthlyIncome: round(stressIncome(profile)), safeEmi: round(stressEmi), remainingAfterEmi: round(stressIncome(profile) - profile.existingEmis - stressEmi), passes: stressEmi >= safeEmiValue * 0.75 },
    reasons,
  }
}
