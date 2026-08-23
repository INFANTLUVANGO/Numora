import { ArrowRight, Pin, ShieldCheck, Sprout } from 'lucide-react'
import type { HomeJourneyResult } from '../../types/journey'
import { formatCompactCurrency, formatCurrency } from '../../utils/formatters'

export function JourneySurplusNotes({ result, onOpenCalculator }: { result: HomeJourneyResult; onOpenCalculator: (slug: string, inputs: Record<string, number>) => void }) {
  if (result.monthlyRoom <= 0) return null

  return (
    <section className="journey-surplus section-shell">
      <div className="section-heading section-heading--split">
        <div><span className="eyebrow">Your monthly surplus</span><h2>Choose what it can do next.</h2></div>
        <p>These are two separate uses of the same {formatCompactCurrency(result.monthlyRoom)} surplus. Pick the one that matters most right now.</p>
      </div>
      <div className="pinned-comparison journey-surplus__notes">
        <div className="pinned-comparison__rail">
          <article className="pinned-note journey-surplus-note">
            <div className="pinned-note__top"><span><Pin size={12} /> <Sprout size={12} /> SIP OPTION</span></div>
            <small>Monthly SIP</small>
            <strong>{formatCurrency(result.sipProjection.monthlyInvestment)}</strong>
            <div className="pinned-note__metrics">
              <p><span>Projected corpus</span><b>{formatCompactCurrency(result.sipProjection.projectedCorpus)}</b></p>
              <p><span>Total invested</span><b>{formatCompactCurrency(result.sipProjection.totalInvested)}</b></p>
              <p><span>Estimated gains</span><b>{formatCompactCurrency(result.sipProjection.estimatedGains)}</b></p>
              <p><span>Illustration</span><b>{result.sipProjection.annualRate}% · {result.sipProjection.years} yrs</b></p>
            </div>
            <button className="journey-surplus-note__action" type="button" onClick={() => onOpenCalculator('sip-calculator', { monthlyInvestment: result.sipProjection.monthlyInvestment, stepUpRate: 0, annualRate: result.sipProjection.annualRate, years: result.sipProjection.years })}>Open SIP calculator <ArrowRight size={14} /></button>
          </article>

          <article className="pinned-note journey-surplus-note">
            <div className="pinned-note__top"><span><Pin size={12} /> <ShieldCheck size={12} /> SAFETY OPTION</span></div>
            <small>Emergency fund goal</small>
            <strong>{formatCompactCurrency(result.emergencyProjection.goal)}</strong>
            <div className="pinned-note__metrics">
              <p><span>Monthly contribution</span><b>{formatCurrency(result.emergencyProjection.monthlyContribution)}</b></p>
              <p><span>Time to goal</span><b>{result.emergencyProjection.monthsToGoal} months</b></p>
              <p><span>Target coverage</span><b>{result.emergencyProjection.coverageDuration} months</b></p>
              <p><span>Based on</span><b>Projected commitments</b></p>
            </div>
            <button className="journey-surplus-note__action" type="button" onClick={() => onOpenCalculator('emergency-fund-calculator', { monthlyExpenses: result.projectedMonthlyCommitments, currentSavings: 0, coverageDuration: result.emergencyProjection.coverageDuration, monthlyContribution: result.emergencyProjection.monthlyContribution })}>Open emergency fund <ArrowRight size={14} /></button>
          </article>
        </div>
      </div>
    </section>
  )
}
