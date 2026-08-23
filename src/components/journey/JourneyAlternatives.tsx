import { Check, RotateCcw, SlidersHorizontal } from 'lucide-react'
import type { JourneyAlternative } from '../../types/journey'
import { formatCurrency, formatDuration } from '../../utils/formatters'

export function JourneyAlternatives({ alternatives, activeId, onApply, onRestore }: { alternatives: JourneyAlternative[]; activeId: string | null; onApply: (alternative: JourneyAlternative) => void; onRestore: () => void }) {
  return (
    <section className="journey-alternatives">
      <div className="section-heading"><span className="eyebrow">What if?</span><h2>Explore a better version of this plan.</h2><p>Only scenarios that fit your monthly cash flow or improve the loan outcome are shown.</p></div>
      <div className="journey-alternatives__grid">{alternatives.map((alternative) => {
        const active = activeId === alternative.id
        return <button type="button" aria-pressed={active} className={active ? 'is-active' : ''} onClick={() => onApply(alternative)} key={alternative.id}><div className="journey-alternatives__icon">{active ? <Check size={18} /> : <SlidersHorizontal size={18} />}</div><span>{alternative.title}</span><p>{alternative.description}</p><div className="journey-alternatives__numbers"><div><small>HOME</small><strong>{formatCurrency(alternative.homePrice)}</strong></div><div><small>EMI</small><strong>{formatCurrency(alternative.monthlyEmi)}</strong></div><div><small>SURPLUS</small><strong>{formatCurrency(alternative.monthlyRoom)}</strong></div><div><small>INTEREST</small><strong>{formatCurrency(alternative.totalInterest)}</strong></div><div><small>TENURE</small><strong>{formatDuration(alternative.tenureMonths)}</strong></div></div></button>
      })}</div>
      {activeId && <button className="journey-restore" type="button" onClick={onRestore}><RotateCcw size={14} /> Return to my original plan</button>}
    </section>
  )
}
