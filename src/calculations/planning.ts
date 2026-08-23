import type { CalculatorResult } from '../types/calculator'
import { formatCompactCurrency } from '../utils/formatters'

export function calculateSalary(inputs: Record<string, number>): CalculatorResult {
  const bonusIncluded = inputs.bonusIncluded === 1
  const fixedCtc = Math.max(0, inputs.annualCtc - (bonusIncluded ? inputs.annualBonus : 0))
  const totalAnnualCompensation = inputs.annualCtc + (bonusIncluded ? 0 : inputs.annualBonus)
  const basic = fixedCtc * (inputs.basicPercent / 100)
  const employeeEpf = Math.min(basic, 180000) * (inputs.epfRate / 100)
  const employerEpf = employeeEpf
  const gratuity = basic * 0.0481
  const cashGross = Math.max(0, fixedCtc - employerEpf - gratuity)
  const monthlyPreTax = (cashGross - employeeEpf) / 12
  return {
    primary: { label: 'Monthly fixed pre-tax take-home', value: monthlyPreTax, kind: 'currency' },
    summary: bonusIncluded
      ? `The bonus is inside your CTC and paid separately, leaving an estimated fixed monthly take-home of ${formatCompactCurrency(monthlyPreTax)}.`
      : `The bonus is additional to your CTC and does not reduce the estimated fixed monthly take-home of ${formatCompactCurrency(monthlyPreTax)}.`,
    breakdown: [
      { label: 'Annual fixed cash salary', value: Math.max(0, cashGross - employeeEpf), kind: 'currency' },
      { label: 'Annual bonus paid separately', value: inputs.annualBonus, kind: 'currency' },
      { label: 'Total annual compensation', value: totalAnnualCompensation, kind: 'currency' },
    ],
    insights: [bonusIncluded ? 'The annual bonus has been separated from the fixed monthly salary because it is included in CTC.' : 'The annual bonus has been added above CTC and does not reduce fixed monthly salary.', 'Income tax, professional tax and company-specific deductions are not included here.'],
    chart: [
      { label: 'Cash component', value: cashGross, color: '#163f3a' },
      { label: 'Bonus', value: inputs.annualBonus, color: '#ffb000' },
      { label: 'Benefits', value: employerEpf + gratuity, color: '#7f6df2' },
    ],
  }
}

export function calculateBudget(inputs: Record<string, number>): CalculatorResult {
  const spending = inputs.essentials + inputs.lifestyle + inputs.emi
  const savings = inputs.monthlyIncome - spending
  const rate = inputs.monthlyIncome ? (savings / inputs.monthlyIncome) * 100 : 0
  return {
    primary: { label: savings >= 0 ? 'Monthly surplus' : 'Monthly shortfall', value: Math.abs(savings), kind: 'currency', tone: savings >= 0 ? 'positive' : 'warning' },
    summary: savings >= 0 ? `You retain ${formatCompactCurrency(savings)} after planned monthly spending.` : `Planned spending exceeds income by ${formatCompactCurrency(Math.abs(savings))}.`,
    breakdown: [
      { label: 'Total spending', value: spending, kind: 'currency' },
      { label: 'Savings rate', value: rate, kind: 'percentage', tone: rate >= 20 ? 'positive' : 'warning' },
      { label: 'EMI share of income', value: inputs.monthlyIncome ? (inputs.emi / inputs.monthlyIncome) * 100 : 0, kind: 'percentage' },
    ],
    insights: [rate >= 20 ? 'Your planned savings rate is at or above 20%.' : 'Consider reviewing flexible spending to create more monthly room.', 'A budget works best when it reflects irregular annual expenses too.'],
    chart: [
      { label: 'Essentials', value: inputs.essentials, color: '#254e78' },
      { label: 'Lifestyle', value: inputs.lifestyle, color: '#ffb000' },
      { label: 'EMIs', value: inputs.emi, color: '#ff5c35' },
      { label: 'Surplus', value: Math.max(0, savings), color: '#163f3a' },
    ],
  }
}

export function calculateEmergencyFund(inputs: Record<string, number>): CalculatorResult {
  const target = inputs.monthlyExpenses * inputs.coverageDuration
  const remaining = Math.max(0, target - inputs.currentSavings)
  const currentCoverage = inputs.monthlyExpenses > 0 ? inputs.currentSavings / inputs.monthlyExpenses : 0
  const progress = target > 0 ? Math.min(100, (inputs.currentSavings / target) * 100) : 0
  const goalReached = target > 0 && inputs.currentSavings >= target
  const monthsToGoal = !goalReached && inputs.monthlyContribution > 0 ? Math.ceil(remaining / inputs.monthlyContribution) : 0
  const timeline = goalReached ? 'Goal Reached' : inputs.monthlyContribution > 0 ? `${monthsToGoal} months` : 'Add monthly contribution'
  return {
    primary: { label: 'Emergency fund goal', value: target, kind: 'currency' },
    summary: goalReached
      ? `Your current emergency savings have reached the ${inputs.coverageDuration}-month target.`
      : inputs.monthlyContribution > 0
        ? `Contributing ${formatCompactCurrency(inputs.monthlyContribution)} monthly may close the remaining gap in about ${monthsToGoal} months.`
        : `You need ${formatCompactCurrency(remaining)} more to complete your ${inputs.coverageDuration}-month emergency fund.`,
    breakdown: [
      { label: 'Current emergency savings', value: inputs.currentSavings, kind: 'currency' },
      { label: 'Remaining amount', value: remaining, kind: 'currency', tone: goalReached ? 'positive' : 'warning' },
      { label: 'Current coverage', value: currentCoverage, kind: 'months' },
      { label: 'Target coverage', value: inputs.coverageDuration, kind: 'months' },
      { label: 'Funding progress', value: progress, kind: 'percentage', tone: goalReached ? 'positive' : 'default' },
      { label: 'Estimated time to goal', value: monthsToGoal, displayValue: timeline, kind: 'months', tone: goalReached ? 'positive' : 'default' },
    ],
    insights: [goalReached ? 'Your selected emergency-fund goal is fully funded.' : inputs.monthlyContribution > 0 ? `Continue the planned monthly contribution to reach the target in approximately ${monthsToGoal} months.` : 'Add an optional monthly contribution to estimate how long reaching the goal may take.', 'Keep emergency savings accessible and separate from long-term investments.'],
    chart: [
      { label: 'Current savings', value: Math.min(target, inputs.currentSavings), color: '#163f3a' },
      { label: 'Remaining', value: remaining, color: '#ff5c35' },
    ],
  }
}

export function calculateRetirement(inputs: Record<string, number>): CalculatorResult {
  const yearsToRetire = Math.max(0, inputs.retirementAge - inputs.currentAge)
  const annualRate = inputs.annualRate / 100
  const inflationRate = Math.max(0, inputs.inflationRate ?? 0) / 100
  const monthlyExpensesAtRetirement = inputs.monthlyExpensesAfterRetirement * (1 + inflationRate) ** yearsToRetire
  const retirementCorpusNeeded = monthlyExpensesAtRetirement * 12 * inputs.retirementDuration
  const projectedCurrentSavings = inputs.currentSavings * (1 + annualRate) ** yearsToRetire
  const annualContributionFactor = yearsToRetire === 0 ? 0 : annualRate === 0 ? yearsToRetire : ((1 + annualRate) ** yearsToRetire - 1) / annualRate
  const projectedMonthlyInvestments = inputs.monthlyInvestment * 12 * annualContributionFactor
  const projectedRetirementCorpus = projectedCurrentSavings + projectedMonthlyInvestments
  const additionalCorpusNeeded = Math.max(0, retirementCorpusNeeded - inputs.currentSavings)
  const amountNeededAfterSavingsGrowth = Math.max(0, retirementCorpusNeeded - projectedCurrentSavings)
  const monthlyInvestmentNeeded = annualContributionFactor > 0 ? amountNeededAfterSavingsGrowth / annualContributionFactor / 12 : amountNeededAfterSavingsGrowth
  const surplusOrShortfall = projectedRetirementCorpus - retirementCorpusNeeded
  const hasSurplus = surplusOrShortfall >= 0
  return {
    primary: { label: hasSurplus ? 'Projected retirement surplus' : 'Projected retirement shortfall', value: Math.abs(surplusOrShortfall), kind: 'currency', tone: hasSurplus ? 'positive' : 'warning' },
    summary: hasSurplus
      ? `Your projected corpus of ${formatCompactCurrency(projectedRetirementCorpus)} is about ${formatCompactCurrency(surplusOrShortfall)} above the estimated requirement.`
      : `You may need ${formatCompactCurrency(Math.abs(surplusOrShortfall))} more because the projected corpus is ${formatCompactCurrency(projectedRetirementCorpus)} against a target of ${formatCompactCurrency(retirementCorpusNeeded)}.`,
    breakdown: [
      { label: 'Retirement corpus needed', value: retirementCorpusNeeded, kind: 'currency' },
      { label: 'Projected retirement corpus', value: projectedRetirementCorpus, kind: 'currency', tone: hasSurplus ? 'positive' : 'warning' },
      { label: 'Current retirement savings', value: inputs.currentSavings, kind: 'currency' },
      { label: 'Additional corpus needed today', value: additionalCorpusNeeded, kind: 'currency' },
      { label: 'Years until retirement', value: yearsToRetire, kind: 'years' },
      { label: 'Monthly investment needed', value: monthlyInvestmentNeeded, kind: 'currency' },
      { label: 'Monthly expenses at retirement', value: monthlyExpensesAtRetirement, kind: 'currency' },
    ],
    insights: [hasSurplus ? 'Your current plan is projected to meet the estimated retirement requirement.' : `Your current monthly investment is ${formatCompactCurrency(inputs.monthlyInvestment)}; reaching the target may require approximately ${formatCompactCurrency(monthlyInvestmentNeeded)} per month.`, `${formatCompactCurrency(inputs.monthlyExpensesAfterRetirement)} in today’s monthly expenses becomes approximately ${formatCompactCurrency(monthlyExpensesAtRetirement)} at retirement using ${inputs.inflationRate ?? 0}% inflation.`],
    chart: [
      { label: 'Savings value at retirement', value: projectedCurrentSavings, color: '#254e78' },
      { label: 'Value from monthly investing', value: projectedMonthlyInvestments, color: '#ff5c35' },
    ],
  }
}
