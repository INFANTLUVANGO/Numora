import { ExternalLink, ShieldCheck } from 'lucide-react'
import type { CalculatorDefinition } from '../../types/calculator'

export function TrustRecord({ calculator }: { calculator: CalculatorDefinition }) {
  return (
    <section className="trust-record">
      <div className="trust-record__title"><ShieldCheck size={22} /><div><span className="eyebrow">Trust record</span><h2>Method, assumptions and limits</h2></div><span className="review-badge">Reviewed {calculator.reviewed}</span></div>
      <div className="trust-record__body">
        <div><h3>Calculation assumptions</h3><ul>{calculator.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul></div>
        <div><h3>Important limitation</h3><p>This result is an educational estimate based only on the values entered. It is not a recommendation or professional financial advice.</p>{calculator.sourceUrl && <a href={calculator.sourceUrl} target="_blank" rel="noreferrer">{calculator.sourceLabel} <ExternalLink size={14} /></a>}</div>
      </div>
    </section>
  )
}
