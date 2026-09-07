export function calculateEmi(principal: number, annualRate: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0
  const monthlyRate = annualRate / 12
  if (monthlyRate === 0) return principal / tenureMonths
  const factor = Math.pow(1 + monthlyRate, tenureMonths)
  return principal * monthlyRate * factor / (factor - 1)
}

export function principalForEmi(emi: number, annualRate: number, tenureMonths: number): number {
  if (emi <= 0 || tenureMonths <= 0) return 0
  const monthlyRate = annualRate / 12
  if (monthlyRate === 0) return emi * tenureMonths
  const factor = Math.pow(1 + monthlyRate, tenureMonths)
  return emi * (factor - 1) / (monthlyRate * factor)
}

export function totalRepayment(principal: number, annualRate: number, tenureMonths: number): number {
  return calculateEmi(principal, annualRate, tenureMonths) * tenureMonths
}
