import type { CalculatorResult } from '../types/calculator'
import { formatCompactCurrency } from '../utils/formatters'
import { annualPercentageToMonthlyRate as monthlyRate } from './helpers'

export function calculateSip(inputs: Record<string, number>, mode: 'calculate' | 'goal'): CalculatorResult {
  const rate = monthlyRate(inputs.annualRate)
  const months = Math.max(1, inputs.years * 12)
  const stepUpRate = Math.max(0, inputs.stepUpRate ?? 0) / 100
  const project = (startingMonthly: number) => {
    let balance = 0
    let invested = 0
    let monthly = startingMonthly
    for (let month = 1; month <= months; month += 1) {
      if (month > 1 && (month - 1) % 12 === 0) monthly *= 1 + stepUpRate
      invested += monthly
      balance = (balance + monthly) * (1 + rate)
    }
    return { balance, invested, finalMonthly: monthly }
  }
  const unitProjection = project(1)
  const monthly = mode === 'goal' ? inputs.targetAmount / Math.max(1, unitProjection.balance) : inputs.monthlyInvestment
  const projection = project(monthly)
  const corpus = projection.balance
  const invested = projection.invested
  const gain = corpus - invested
  const increaseText = stepUpRate > 0 ? `, increasing by ${inputs.stepUpRate}% each year,` : ''

  return {
    primary: { label: mode === 'goal' ? 'Monthly SIP required' : 'Estimated future value', value: mode === 'goal' ? monthly : corpus, kind: 'currency' },
    summary: mode === 'goal'
      ? `A starting monthly SIP of about ${formatCompactCurrency(monthly)}${increaseText} may build your target over ${inputs.years} years.`
      : `Your contributions may grow to ${formatCompactCurrency(corpus)} over ${inputs.years} years${stepUpRate > 0 ? ` with a ${inputs.stepUpRate}% annual increase` : ''}.`,
    breakdown: [
      { label: 'Total invested', value: invested, kind: 'currency' },
      { label: 'Estimated gains', value: gain, kind: 'currency', tone: 'positive' },
      { label: stepUpRate > 0 ? 'Final monthly SIP' : 'Monthly SIP', value: projection.finalMonthly, kind: 'currency' },
    ],
    insights: [
      `Estimated gains account for ${corpus ? Math.max(0, (gain / corpus) * 100).toFixed(0) : 0}% of the final value.`,
      stepUpRate > 0 ? `Your SIP rises by ${inputs.stepUpRate}% once every 12 months. Make sure each increase remains comfortable.` : 'A 0% annual SIP increase is a normal SIP with the same monthly contribution throughout.',
      'Longer horizons give compounding more time to work, but market returns are not guaranteed.',
    ],
    chart: [
      { label: 'Invested', value: invested, color: '#163f3a' },
      { label: 'Growth', value: Math.max(0, gain), color: '#ff5c35' },
    ],
  }
}

export function calculateLumpsum(inputs: Record<string, number>): CalculatorResult {
  const future = inputs.investment * (1 + inputs.annualRate / 100) ** inputs.years
  const gains = future - inputs.investment
  return {
    primary: { label: 'Estimated future value', value: future, kind: 'currency' },
    summary: `${formatCompactCurrency(inputs.investment)} may grow to ${formatCompactCurrency(future)} over ${inputs.years} years.`,
    breakdown: [
      { label: 'Initial investment', value: inputs.investment, kind: 'currency' },
      { label: 'Estimated gains', value: gains, kind: 'currency', tone: 'positive' },
      { label: 'Absolute return', value: inputs.investment ? (gains / inputs.investment) * 100 : 0, kind: 'percentage' },
    ],
    insights: ['This is a projection using a constant annual return.', 'Actual returns can vary significantly from year to year.'],
    chart: [
      { label: 'Principal', value: inputs.investment, color: '#254e78' },
      { label: 'Growth', value: Math.max(0, gains), color: '#ffb000' },
    ],
  }
}

export function calculateSwp(inputs: Record<string, number>): CalculatorResult {
  const initialCorpus = Math.max(0, inputs.initialCorpus)
  const monthlyWithdrawal = Math.max(0, inputs.monthlyWithdrawal)
  const monthlyRateValue = monthlyRate(inputs.annualRate)
  const totalMonths = Math.max(1, Math.round(inputs.years * 12))
  const annualIncrease = Math.max(0, inputs.withdrawalIncrease ?? 0) / 100
  let balance = initialCorpus
  let totalWithdrawn = 0
  let monthsCompleted = 0

  for (let month = 1; month <= totalMonths && balance > 0; month += 1) {
    balance *= 1 + monthlyRateValue
    const withdrawal = monthlyWithdrawal * (1 + annualIncrease) ** Math.floor((month - 1) / 12)
    const actualWithdrawal = Math.min(balance, withdrawal)
    balance -= actualWithdrawal
    totalWithdrawn += actualWithdrawal
    monthsCompleted = month
  }

  const investmentGrowth = balance + totalWithdrawn - initialCorpus
  const corpusDepleted = balance <= 0 && monthsCompleted < totalMonths
  const summary = corpusDepleted
    ? `Your corpus may be exhausted after approximately ${(monthsCompleted / 12).toFixed(1)} years of withdrawals.`
    : `You may withdraw ${formatCompactCurrency(totalWithdrawn)} over ${inputs.years} years and retain about ${formatCompactCurrency(balance)}.`

  return {
    primary: { label: 'Remaining corpus', value: Math.max(0, balance), kind: 'currency', tone: corpusDepleted ? 'warning' : 'positive' },
    summary,
    breakdown: [
      { label: 'Starting corpus', value: initialCorpus, kind: 'currency' },
      { label: 'Total withdrawn', value: totalWithdrawn, kind: 'currency' },
      { label: 'Estimated investment growth', value: investmentGrowth, kind: 'currency', tone: 'positive' },
      { label: 'Monthly withdrawal', value: monthlyWithdrawal, kind: 'currency' },
      { label: 'Withdrawal period', value: inputs.years, kind: 'years' },
      { label: 'Corpus lasts', value: corpusDepleted ? monthsCompleted / 12 : inputs.years, kind: 'years', displayValue: corpusDepleted ? `Depleted after ${(monthsCompleted / 12).toFixed(1)} years` : `Full ${inputs.years}-year period`, tone: corpusDepleted ? 'warning' : 'positive' },
    ],
    insights: [
      corpusDepleted ? 'At this withdrawal rate, the corpus may not last for the full selected period.' : `After the selected period, approximately ${formatCompactCurrency(balance)} may remain for future needs.`,
      'Estimated investment growth is calculated as the remaining corpus plus withdrawals, minus the starting corpus. It is a projection before taxes, fees and market volatility.',
    ],
    chart: [
      { label: 'Withdrawn', value: Math.max(0, totalWithdrawn), color: '#ff5c35' },
      { label: 'Remaining', value: Math.max(0, balance), color: '#163f3a' },
    ],
  }
}
