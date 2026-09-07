import { formatMoney, type CurrencyCode } from './currency'

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export function formatRupees(value: number): string {
  return formatMoney(value, 'INR')
}

export type { CurrencyCode } from './currency'

export function formatAmount(value: number, currency: CurrencyCode): string {
  return formatMoney(value, currency)
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}
