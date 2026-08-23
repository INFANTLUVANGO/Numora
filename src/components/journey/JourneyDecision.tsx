import { ArrowRight, Check, CircleAlert, ShieldCheck, Sparkles } from 'lucide-react'
import type { HomeJourneyResult } from '../../types/journey'
import { formatCurrency } from '../../utils/formatters'

const statusLabels = { comfortable: 'COMFORTABLE MONTHLY CASH FLOW', manageable: 'MANAGEABLE', tight: 'NO MONTHLY SURPLUS', 'not-ready': 'NOT READY YET' }

export function JourneyDecision({ result, onOpenCalculator }: { result: HomeJourneyResult; onOpenCalculator: (slug: string) => void }) {
  const statusIcon = result.status === 'comfortable' ? <ShieldCheck size={20} /> : result.status === 'not-ready' ? <CircleAlert size={20} /> : <Sparkles size={20} />

  return (
    <section className={`journey-decision journey-decision--${result.status}`}>
      <div className="journey-decision__head"><div className="journey-decision__signal">{statusIcon}</div><div><span>YOUR NUMORA DECISION</span><strong>{statusLabels[result.status]}</strong></div></div>
      <h2>{result.statusTitle}</h2>
      <p className="journey-decision__description">{result.statusDescription}</p>
      <div className="journey-metrics">
        <div><span>{result.intent === 'find-budget' ? 'Estimated home budget' : 'Home price'}</span><strong>{formatCurrency(result.homePrice)}</strong></div>
        <div><span>{result.extraMonthlyPayment > 0 ? 'Monthly loan payment' : 'Required EMI'}</span><strong>{formatCurrency(result.monthlyEmi)}</strong></div>
        <div><span>Monthly surplus</span><strong>{formatCurrency(result.monthlyRoom)}</strong></div>
        <div><span>Total interest</span><strong>{formatCurrency(result.totalInterest)}</strong></div>
      </div>
      <div className="journey-decision__columns">
        <div><span className="journey-label">WHY THIS RESULT</span>{result.reasons.map((reason) => <p key={reason}><Check size={15} />{reason}</p>)}</div>
        <div><span className="journey-label">NEXT BEST MOVES</span>{result.nextSteps.map((step) => <p key={step}><ArrowRight size={15} />{step}</p>)}</div>
      </div>
      <div className="journey-decision__links"><button type="button" onClick={() => onOpenCalculator('emi-calculator')}>Inspect this loan in EMI calculator <ArrowRight size={15} /></button></div>
    </section>
  )
}
