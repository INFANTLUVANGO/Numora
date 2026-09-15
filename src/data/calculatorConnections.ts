import type { CalculatorResult } from '../types/calculator'

export function getConnectedInputs(
  from: string,
  to: string,
  resultValue: number,
  breakdown: CalculatorResult['breakdown'],
  sourceInputs: Record<string, number>,
): Record<string, number> {
  if (from === 'salary-calculator' && to === 'monthly-budget-planner') return { monthlyIncome: resultValue }
  if (from === 'monthly-budget-planner' && to === 'emergency-fund-calculator') return { monthlyExpenses: breakdown[0]?.value ?? 0 }
  if (from === 'home-affordability-calculator' && to === 'emi-calculator') return { loanAmount: breakdown[0]?.value ?? 0 }
  if (from === 'emergency-fund-calculator' && to === 'sip-calculator') return { monthlyInvestment: Math.max(1000, (breakdown[1]?.value ?? 0) / 12) }
  if (from === 'lumpsum-calculator' && to === 'swp-calculator') return { initialCorpus: resultValue }
  if (from === 'retirement-calculator' && to === 'swp-calculator') {
    const yearsToRetire = Math.max(0, sourceInputs.retirementAge - sourceInputs.currentAge)
    const monthlyExpensesAtRetirement = sourceInputs.monthlyExpensesAfterRetirement * (1 + (sourceInputs.inflationRate ?? 0) / 100) ** yearsToRetire
    return {
      initialCorpus: breakdown.find((item) => item.label === 'Projected retirement corpus')?.value ?? 0,
      monthlyWithdrawal: monthlyExpensesAtRetirement,
      years: sourceInputs.retirementDuration,
    }
  }
  return {}
}
