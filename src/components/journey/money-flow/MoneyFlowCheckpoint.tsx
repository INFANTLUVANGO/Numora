import { CreditCard, ShieldCheck, Target, WalletCards } from 'lucide-react'
import type { MoneyFlowResult } from '../../../types/moneyFlow'
import { formatCompactCurrency } from '../../../utils/formatters'

const checkpointContent = (stepIndex: number, result: MoneyFlowResult, goalName: string) => {
  if (stepIndex === 0) {
    const isShortfall = result.availableMoney < 0
    return {
      Icon: WalletCards,
      label: isShortfall ? 'MONTHLY SHORTFALL' : 'AVAILABLE EACH MONTH',
      value: formatCompactCurrency(Math.abs(result.availableMoney)),
      description: isShortfall
        ? 'Your entered commitments and investments currently exceed take-home income.'
        : 'This is genuinely unallocated after expenses, required payments and existing investments.',
      footerLabel: 'Before existing investments',
      footerValue: formatCompactCurrency(result.monthlyCashFlowBeforeInvesting),
      warning: isShortfall,
    }
  }

  if (stepIndex === 1) {
    return {
      Icon: ShieldCheck,
      label: 'CURRENT SAFETY COVER',
      value: `${result.currentEmergencyCoverage.toFixed(1)} months`,
      description: result.emergencyRemaining > 0
        ? `${formatCompactCurrency(result.emergencyRemaining)} remains to reach the selected safety target.`
        : 'Your selected emergency-fund target is already covered.',
      footerLabel: `${result.emergencyCoverageMonths}-month target`,
      footerValue: formatCompactCurrency(result.emergencyTarget),
      warning: result.currentEmergencyCoverage < 1,
    }
  }

  if (stepIndex === 2) {
    return {
      Icon: CreditCard,
      label: result.debtBalance > 0 ? 'EXPENSIVE DEBT BALANCE' : 'EXPENSIVE DEBT',
      value: result.debtBalance > 0 ? formatCompactCurrency(result.debtBalance) : 'Not added',
      description: result.debtBalance > 0
        ? 'NUMORA places a starter safety buffer before accelerating this balance.'
        : 'Leave this off when you do not have credit-card, personal-loan or similar expensive debt.',
      footerLabel: result.debtBalance > 0 ? 'Required payment' : 'Plan impact',
      footerValue: result.debtBalance > 0 ? `${formatCompactCurrency(result.debtMinimumPayment)} / month` : 'No debt stage',
      warning: false,
    }
  }

  return {
    Icon: Target,
    label: result.goalTarget > 0 ? (goalName.trim() || 'SHORT-TERM GOAL').toUpperCase() : 'SHORT-TERM GOAL',
    value: result.goalTarget > 0 ? formatCompactCurrency(result.goalRemaining) : 'Not added',
    description: result.goalTarget > 0
      ? 'The decision will show when this goal can begin after higher priorities.'
      : 'You can build the money order without adding a short-term goal.',
    footerLabel: result.goalMonths > 0 ? 'Wanted within' : 'Target date',
    footerValue: result.goalMonths > 0 ? `${result.goalMonths} months` : 'Flexible',
    warning: false,
  }
}

export function MoneyFlowCheckpoint({ stepIndex, result, goalName }: { stepIndex: number; result: MoneyFlowResult; goalName: string }) {
  const content = checkpointContent(stepIndex, result, goalName)
  const Icon = content.Icon

  return (
    <aside className={`journey-checkpoint money-flow-checkpoint ${content.warning ? 'journey-checkpoint--warning' : ''}`}>
      <div className="journey-checkpoint__icon"><Icon size={20} /></div>
      <span>{content.label}</span>
      <strong>{content.value}</strong>
      <p>{content.description}</p>
      <div className="journey-checkpoint__line"><span>{content.footerLabel}</span><b>{content.footerValue}</b></div>
    </aside>
  )
}
