import { Gauge, House, WalletCards } from 'lucide-react'
import type { HomeJourneyResult, JourneyIntent } from '../../types/journey'
import { formatCurrency } from '../../utils/formatters'

export function JourneyCheckpoint({ stepIndex, result, intent }: { stepIndex: number; result: HomeJourneyResult; intent: JourneyIntent }) {
  if (stepIndex === 0) {
    return (
      <aside className="journey-checkpoint journey-checkpoint--calm">
        <div className="journey-checkpoint__icon"><WalletCards size={21} /></div>
        <span>AVAILABLE FOR HOME EMI</span>
        <strong>{formatCurrency(result.availableForHomeEmi)}</strong>
        <p>What remains after your living expenses and existing EMIs.</p>
        <div className="journey-checkpoint__line"><span>Before the new home loan</span><b>{formatCurrency(result.availableForHomeEmi)}</b></div>
      </aside>
    )
  }

  if (stepIndex === 1) {
    return (
      <aside className="journey-checkpoint journey-checkpoint--calm">
        <div className="journey-checkpoint__icon"><House size={21} /></div>
        <span>{intent === 'find-budget' ? 'ESTIMATED COMFORTABLE BUDGET' : 'PLANNED HOME PRICE'}</span>
        <strong>{formatCurrency(intent === 'find-budget' ? result.maxComfortableHome : result.homePrice)}</strong>
        <p>{intent === 'find-budget' ? result.cushionEnabled ? `A starting estimate while keeping ${result.cushionPercent}% of available cash flow as a cushion.` : 'A starting estimate using the full available cash flow for the home EMI.' : 'The down payment is assumed available for this estimate.'}</p>
        <div className="journey-checkpoint__line"><span>Planned down payment</span><b>{formatCurrency(result.downPayment)}</b></div>
      </aside>
    )
  }

  const overLimit = result.monthlyRoom < 0
  return (
    <aside className={`journey-checkpoint ${overLimit ? 'journey-checkpoint--warning' : 'journey-checkpoint--calm'}`}>
      <div className="journey-checkpoint__icon"><Gauge size={21} /></div>
      <span>{overLimit ? 'MONTHLY SHORTFALL' : 'MONTHLY SURPLUS'}</span>
      <strong>{formatCurrency(result.monthlyEmi)}</strong>
      <p>{overLimit ? `${formatCurrency(Math.abs(result.monthlyRoom))} short after all projected commitments.` : `${formatCurrency(result.monthlyRoom)} remains after all projected commitments.`}</p>
      <div className="journey-checkpoint__line"><span>New home EMI</span><b>{formatCurrency(result.monthlyEmi)}</b></div>
    </aside>
  )
}
