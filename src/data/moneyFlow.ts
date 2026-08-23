import type { JourneyDefinition, JourneyInputSpec, JourneyStepSpec } from '../types/journey'
import type { MoneyFlowInputs } from '../types/moneyFlow'

export const moneyFlowDefinition = {
  slug: 'money-flow',
  number: '02',
  category: 'MONEY FLOW',
  icon: 'wallet-cards',
  title: 'Decide what your money should do next.',
  description: 'Turn monthly cash flow, safety, expensive debt and one short-term goal into an ordered allocation plan.',
  options: [
    { id: 'monthly-money-plan', label: 'Build my monthly money order', description: 'Show what needs attention first and where each released rupee should move next.' },
  ],
} satisfies JourneyDefinition

export const moneyFlowInputs: JourneyInputSpec[] = [
  { key: 'monthlyIncome', label: 'Monthly take-home income', hint: 'Money received after regular deductions.', prefix: '₹', min: 0 },
  { key: 'essentialExpenses', label: 'Essential monthly expenses', hint: 'Housing, food, utilities and other necessary costs.', prefix: '₹', min: 0 },
  { key: 'flexibleExpenses', label: 'Flexible monthly spending', hint: 'Lifestyle spending that could be adjusted if needed.', prefix: '₹', min: 0 },
  { key: 'otherEmis', label: 'Other EMIs', hint: 'Required loan payments, excluding the expensive debt entered later.', prefix: '₹', min: 0 },
  { key: 'existingInvestments', label: 'Existing SIP and investments', hint: 'Monthly investing already running. NUMORA will not silently cancel it.', prefix: '₹', min: 0 },
  { key: 'currentEmergencySavings', label: 'Current emergency savings', hint: 'Money currently reserved for financial emergencies.', prefix: '₹', min: 0 },
  { key: 'debtBalance', label: 'Outstanding debt balance', hint: 'Current balance of credit-card, personal-loan or similar expensive debt.', prefix: '₹', min: 0 },
  { key: 'debtAnnualRate', label: 'Debt interest rate', hint: 'Annual interest rate charged on this debt.', suffix: '% / yr', min: 0, max: 60, decimal: true },
  { key: 'debtMinimumPayment', label: 'Required monthly payment', hint: 'Minimum payment already required for this debt.', prefix: '₹', min: 0 },
  { key: 'goalTarget', label: 'Goal target amount', hint: 'Total amount required for the short-term goal.', prefix: '₹', min: 0 },
  { key: 'goalSaved', label: 'Already saved for this goal', hint: 'Amount currently set aside only for this goal.', prefix: '₹', min: 0 },
  { key: 'goalMonths', label: 'Months until needed', hint: 'Enter 0 when there is no fixed deadline.', suffix: 'months', min: 0, max: 120 },
]

export const moneyFlowSteps: JourneyStepSpec[] = [
  { number: '01', eyebrow: 'YOUR MONTH', title: 'Find the money that is truly available.', description: 'Separate necessary costs, flexible spending and investments so a shortfall is not mistaken for surplus.', inputKeys: ['monthlyIncome', 'essentialExpenses', 'flexibleExpenses', 'otherEmis', 'existingInvestments'] },
  { number: '02', eyebrow: 'SAFETY', title: 'Check the financial buffer first.', description: 'Emergency savings are measured against essential expenses and required monthly payments.', inputKeys: ['currentEmergencySavings'] },
  { number: '03', eyebrow: 'EXPENSIVE DEBT', title: 'Bring high-interest debt into the order.', description: 'This stage is optional and focuses on debt that can meaningfully slow financial progress.', inputKeys: ['debtBalance', 'debtAnnualRate', 'debtMinimumPayment'] },
  { number: '04', eyebrow: 'SHORT-TERM GOAL', title: 'Add one goal that competes for the same money.', description: 'NUMORA will show when the goal can begin and whether the entered timeline remains realistic.', inputKeys: ['goalTarget', 'goalSaved', 'goalMonths'] },
]

export const moneyFlowDefaults: MoneyFlowInputs = {
  monthlyIncome: 100000,
  essentialExpenses: 40000,
  flexibleExpenses: 15000,
  otherEmis: 10000,
  existingInvestments: 10000,
  currentEmergencySavings: 50000,
  emergencyCoverageMonths: 6,
  hasHighInterestDebt: 0,
  debtBalance: 0,
  debtAnnualRate: 24,
  debtMinimumPayment: 0,
  hasShortTermGoal: 1,
  goalTarget: 150000,
  goalSaved: 30000,
  goalMonths: 12,
}
