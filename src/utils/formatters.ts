import type { ResultKind } from '../types/calculator'

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const number = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 })

const currencies: Record<number, { currency: string; locale: string; symbol: string }> = {
  1: { currency: 'INR', locale: 'en-IN', symbol: '₹' },
  2: { currency: 'USD', locale: 'en-US', symbol: '$' },
  3: { currency: 'EUR', locale: 'en-IE', symbol: '€' },
  4: { currency: 'GBP', locale: 'en-GB', symbol: '£' },
}

export const formatCurrency = (value: number) => inr.format(Math.round(value))

export const getCurrencySymbol = (currencyCode: number) => currencies[currencyCode]?.symbol ?? currencies[1].symbol

export const formatCurrencyByCode = (value: number, currencyCode: number) => {
  const selected = currencies[currencyCode] ?? currencies[1]
  return new Intl.NumberFormat(selected.locale, {
    style: 'currency',
    currency: selected.currency,
    maximumFractionDigits: 0,
  }).format(Math.round(value))
}

export const formatCompactCurrency = (value: number) => {
  const absolute = Math.abs(value)
  if (absolute >= 10_000_000) return `₹${number.format(value / 10_000_000)} Cr`
  if (absolute >= 100_000) return `₹${number.format(value / 100_000)} L`
  if (absolute >= 1_000) return `₹${number.format(value / 1_000)}K`
  return formatCurrency(value)
}

export const formatResult = (value: number, kind: ResultKind = 'number') => {
  if (!Number.isFinite(value)) return '—'
  if (kind === 'currency') return formatCurrency(value)
  if (kind === 'percentage') return `${number.format(value)}%`
  if (kind === 'months') return `${number.format(value)} months`
  if (kind === 'years') return `${number.format(value)} years`
  return number.format(value)
}

export const parseNumber = (value: string) => {
  const parsed = Number(value.replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}
