export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export function formatRupees(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(Math.max(0, value))
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}
