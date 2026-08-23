import type { CalculatorResult } from '../types/calculator'
import { formatCompactCurrency } from '../utils/formatters'
import { annualPercentageToMonthlyRate as monthlyRate } from './helpers'

export function calculateEmi(inputs: Record<string, number>, mode: 'calculate' | 'goal'): CalculatorResult {
  const rate = monthlyRate(inputs.annualRate)
  const months = Math.max(1, inputs.years * 12)
  const multiplier = rate === 0 ? 1 / months : (rate * (1 + rate) ** months) / ((1 + rate) ** months - 1)
  const principal = mode === 'goal' ? inputs.affordableEmi / multiplier : inputs.loanAmount
  const emi = principal * multiplier
  const total = emi * months
  const interest = total - principal
  return {
    primary: { label: mode === 'goal' ? 'Estimated affordable loan' : 'Monthly EMI', value: mode === 'goal' ? principal : emi, kind: 'currency' },
    summary: mode === 'goal'
      ? `An EMI of ${formatCompactCurrency(inputs.affordableEmi)} may support a loan near ${formatCompactCurrency(principal)}.`
      : `Your estimated monthly repayment is ${formatCompactCurrency(emi)} for ${inputs.years} years.`,
    breakdown: [
      { label: 'Principal', value: principal, kind: 'currency' },
      { label: 'Total interest', value: interest, kind: 'currency', tone: 'warning' },
      { label: 'Total repayment', value: total, kind: 'currency' },
    ],
    insights: [
      `Interest forms ${total ? Math.max(0, (interest / total) * 100).toFixed(0) : 0}% of total repayment.`,
      'Processing fees, insurance, changing rates and prepayments are not included.',
    ],
    chart: [
      { label: 'Principal', value: principal, color: '#254e78' },
      { label: 'Interest', value: Math.max(0, interest), color: '#ff5c35' },
    ],
  }
}

export function calculateHomeAffordability(inputs: Record<string, number>): CalculatorResult {
  const availableEmi = Math.max(0, inputs.monthlyHomeLoanPayment)
  const salaryBalance = Math.max(0, inputs.monthlySalary - inputs.totalExpenses)
  const loan = calculateEmi({ affordableEmi: availableEmi, annualRate: inputs.annualRate, years: inputs.years }, 'goal').primary.value
  const homeValue = loan / Math.max(0.1, 1 - inputs.downPaymentPercent / 100)
  const totalRepayment = availableEmi * Math.max(1, inputs.years * 12)
  const totalInterest = Math.max(0, totalRepayment - loan)
  return {
    primary: { label: 'Indicative home budget', value: homeValue, kind: 'currency' },
    summary: `A monthly EMI of ${formatCompactCurrency(availableEmi)} suggests a quick home-budget estimate near ${formatCompactCurrency(homeValue)}.`,
    breakdown: [
      { label: 'Estimated loan amount', value: loan, kind: 'currency' },
      { label: 'Down payment', value: homeValue - loan, kind: 'currency' },
      { label: 'Monthly EMI', value: availableEmi, kind: 'currency' },
      { label: 'Total interest over tenure', value: totalInterest, kind: 'currency', tone: 'warning' },
    ],
    insights: [availableEmi > salaryBalance ? 'The selected EMI is higher than salary minus expenses.' : `${formatCompactCurrency(salaryBalance)} is available after the expenses entered.`, 'This is a quick estimate; lender eligibility and purchase costs are not included.'],
  }
}
