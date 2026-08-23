import { ArrowUpRight, House, Landmark } from 'lucide-react'
import type { BuyVsRentResult } from '../../../types/buyVsRent'
import { formatCurrency } from '../../../utils/formatters'

export function BuyVsRentCheckpoint({ stepIndex, result }: { stepIndex: number; result: BuyVsRentResult }) {
  const view = stepIndex === 0
    ? {
        label: 'PLANNED HOME LOAN',
        value: result.loanAmount,
        description: `${formatCurrency(result.downPayment)} is treated as the upfront amount.`,
        lineLabel: 'Home amount',
        lineValue: result.homePrice,
        icon: <House size={20} />,
      }
    : stepIndex === 1
      ? {
          label: 'ESTIMATED MONTHLY EMI',
          value: result.monthlyEmi,
          description: `Calculated at ${result.annualRate}% for ${result.years} years.`,
          lineLabel: 'Total loan interest',
          lineValue: result.totalInterest,
          icon: <Landmark size={20} />,
        }
      : {
          label: 'FUTURE HOME VALUE',
          value: result.futureHomeValue,
          description: `${result.propertyAppreciation}% annual property appreciation over ${result.years} years.`,
          lineLabel: 'Monthly SIP required',
          lineValue: result.requiredMonthlySip,
          icon: <ArrowUpRight size={20} />,
        }

  return (
    <aside className="journey-checkpoint">
      <div className="journey-checkpoint__icon">{view.icon}</div>
      <span>{view.label}</span>
      <strong>{formatCurrency(view.value)}</strong>
      <p>{view.description}</p>
      <div className="journey-checkpoint__line"><span>{view.lineLabel}</span><b>{formatCurrency(view.lineValue)}</b></div>
    </aside>
  )
}
