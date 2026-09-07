export type CurrencyCode = 'INR' | 'USD' | 'GBP' | 'AED' | 'SGD'

export interface CurrencyConfig {
  code: CurrencyCode
  label: string
  locale: string
  symbol: string
  inrPerUnit: number
}

// Fixed display rates keep the prototype deterministic. They are not live FX quotes.
export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', label: 'India · INR', locale: 'en-IN', symbol: '₹', inrPerUnit: 1 },
  USD: { code: 'USD', label: 'United States · USD', locale: 'en-US', symbol: '$', inrPerUnit: 84 },
  GBP: { code: 'GBP', label: 'United Kingdom · GBP', locale: 'en-GB', symbol: '£', inrPerUnit: 106 },
  AED: { code: 'AED', label: 'UAE · AED', locale: 'en-AE', symbol: 'د.إ', inrPerUnit: 23 },
  SGD: { code: 'SGD', label: 'Singapore · SGD', locale: 'en-SG', symbol: 'S$', inrPerUnit: 63 },
}

export function formatMoney(valueInr: number, currency: CurrencyCode = 'INR'): string {
  const config = CURRENCIES[currency]
  return new Intl.NumberFormat(config.locale, {
    style: 'currency', currency: config.code, maximumFractionDigits: 0,
  }).format(Math.max(0, valueInr / config.inrPerUnit))
}

export function toInr(displayAmount: number, currency: CurrencyCode): number {
  return Math.max(0, displayAmount) * CURRENCIES[currency].inrPerUnit
}

export function fromInr(amountInr: number, currency: CurrencyCode): number {
  return Math.max(0, amountInr) / CURRENCIES[currency].inrPerUnit
}

export function currencyLabel(currency: CurrencyCode): string {
  return CURRENCIES[currency].code
}

export function profileToInr(profile: BorrowerProfile, currency: CurrencyCode): BorrowerProfile {
  const next = { ...profile }
  const moneyKeys = ['requestedAmount', 'monthlyIncomeMin', 'monthlyIncomeMax', 'existingEmis', 'essentialExpenses', 'propertyValue'] as const
  for (const key of moneyKeys) {
    const value = next[key]
    if (typeof value === 'number') (next as Record<string, unknown>)[key] = toInr(value, currency)
  }
  return next
}
import type { BorrowerProfile } from '../types/borrower'
