export interface MoneyFlowInputs {
  monthlyIncome: number
  essentialExpenses: number
  flexibleExpenses: number
  otherEmis: number
  existingInvestments: number
  currentEmergencySavings: number
  emergencyCoverageMonths: number
  hasHighInterestDebt: number
  debtBalance: number
  debtAnnualRate: number
  debtMinimumPayment: number
  hasShortTermGoal: number
  goalTarget: number
  goalSaved: number
  goalMonths: number
}

export type MoneyFlowPriorityId = 'shortfall' | 'create-room' | 'starter-safety' | 'high-interest-debt' | 'emergency-fund' | 'short-term-goal' | 'investing'

export interface MoneyFlowPhase {
  id: Exclude<MoneyFlowPriorityId, 'shortfall' | 'create-room'>
  title: string
  description: string
  monthlyAllocation: number
  totalMonthlyPayment?: number
  remainingTarget: number
  durationMonths: number | null
  startMonth: number
  endMonth: number | null
  ongoing?: boolean
}

export interface MoneyFlowResult {
  debtMinimumPayment: number
  monthlyCashFlowBeforeInvesting: number
  availableMoney: number
  monthlyShortfall: number
  emergencyTarget: number
  currentEmergencySavings: number
  emergencyRemaining: number
  emergencyCoverageMonths: number
  currentEmergencyCoverage: number
  debtBalance: number
  goalTarget: number
  goalSaved: number
  goalRemaining: number
  goalMonths: number
  goalProjectedCompletionMonth: number | null
  goalOnTime: boolean | null
  priorityId: MoneyFlowPriorityId
  priorityTitle: string
  priorityDescription: string
  currentMonthlyAllocation: number
  futureMonthlyInvestment: number
  phases: MoneyFlowPhase[]
  recovery: {
    reduceExistingInvestmentsBy: number
    reduceFlexibleSpendingBy: number
    unresolvedShortfall: number
  }
  rules: string[]
}
