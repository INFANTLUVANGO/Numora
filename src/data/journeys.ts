import type { JourneyDefinition, JourneyInputSpec, JourneyIntent, JourneyStepSpec } from '../types/journey'
import { moneyFlowDefinition } from './moneyFlow'

const homeJourneyIntents: Array<{ id: JourneyIntent; label: string; description: string }> = [
  { id: 'check-home', label: 'Check a specific home', description: 'I know the property price and want to test whether it fits my life.' },
  { id: 'find-budget', label: 'Find my comfortable budget', description: 'I want NUMORA to estimate a home price from my preferred monthly comfort.' },
  { id: 'buy-vs-rent', label: 'Buy this home or rent?', description: 'Compare one home loan with fixed rental choices and investing the difference.' },
]

export const homeJourneyDefinition = {
  slug: 'home-affordability',
  number: '01',
  category: 'HOME',
  icon: 'house',
  title: 'Plan your home decision.',
  description: 'Check affordability, find a comfortable budget, or compare buying with renting and investing.',
  options: homeJourneyIntents,
} satisfies JourneyDefinition

export const journeyCatalog = [homeJourneyDefinition, moneyFlowDefinition]

export const homeJourneyInputs: JourneyInputSpec[] = [
  { key: 'monthlyIncome', label: 'Monthly take-home income', hint: 'Money received each month.', prefix: '₹', min: 0 },
  { key: 'monthlyLivingExpenses', label: 'Monthly living expenses', hint: 'Regular spending, excluding EMIs.', prefix: '₹', min: 0 },
  { key: 'existingEmis', label: 'Existing EMIs', hint: 'Loan payments already running.', prefix: '₹', min: 0 },
  { key: 'homePrice', label: 'Home price', hint: 'The property price you want to test.', prefix: '₹', min: 0 },
  { key: 'downPaymentAmount', label: 'Planned down payment', hint: 'The amount you expect to pay upfront. NUMORA assumes it is available.', prefix: '₹', min: 0 },
  { key: 'annualRate', label: 'Home-loan interest rate', hint: 'The annual rate used for the estimate.', suffix: '% / yr', min: 0, max: 30, step: 0.1, decimal: true },
  { key: 'years', label: 'Repayment period', hint: 'Expected loan tenure.', suffix: 'years', min: 1, max: 35, step: 1 },
]

export const homeJourneySteps: JourneyStepSpec[] = [
  { number: '01', eyebrow: 'MONTHLY LIFE', title: 'See what your monthly life can carry.', description: 'Set what comes in and what already goes out before the new home loan.', inputKeys: ['monthlyIncome', 'monthlyLivingExpenses', 'existingEmis'] },
  { number: '02', eyebrow: 'HOME PLAN', title: 'Bring the home into the picture.', description: 'Add the property and the down payment you expect to use upfront.', inputKeys: ['homePrice', 'downPaymentAmount'] },
  { number: '03', eyebrow: 'LOAN REALITY', title: 'Test the repayment terms.', description: 'Interest and tenure decide how hard the loan works each month.', inputKeys: ['annualRate', 'years'] },
]

export const homeJourneyDefaults: Record<string, number> = {
  monthlyIncome: 90000,
  monthlyLivingExpenses: 38000,
  existingEmis: 8000,
  homePrice: 6000000,
  downPaymentAmount: 1200000,
  monthlyCushionEnabled: 1,
  monthlyCushionPercent: 25,
  annualRate: 8.5,
  years: 20,
}
