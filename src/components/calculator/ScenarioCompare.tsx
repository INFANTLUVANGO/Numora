import { Plus, Trash2 } from 'lucide-react'
import type { SavedScenario } from '../../types/calculator'
import { formatResult } from '../../utils/formatters'

export function ScenarioCompare({ scenarios, onSave, onRemove }: { scenarios: SavedScenario[]; onSave: () => void; onRemove: (id: string) => void }) {
  return (
    <section className="scenario-compare">
      <div className="scenario-compare__head"><div><span className="eyebrow">Scenario board</span><h2>Put up to three plans side by side.</h2></div><button className="secondary-button" type="button" onClick={onSave} disabled={scenarios.length >= 3}><Plus size={17} /> Add current plan</button></div>
      {scenarios.length === 0 ? <div className="scenario-empty"><span>01 — 03</span><p>Adjust the inputs, add this plan, then change the numbers and add another.</p></div> : (
        <div className="scenario-grid">{scenarios.map((scenario, index) => <article key={scenario.id}><div><span>PLAN {String.fromCharCode(65 + index)}</span><button type="button" onClick={() => onRemove(scenario.id)} aria-label={`Remove ${scenario.name}`}><Trash2 size={15} /></button></div><small>{scenario.result.primary.label}</small><strong>{scenario.result.primary.displayValue ?? formatResult(scenario.result.primary.value, scenario.result.primary.kind)}</strong>{scenario.result.breakdown.slice(0, 2).map((item) => <p key={item.label}><span>{item.label}</span><b>{item.displayValue ?? formatResult(item.value, item.kind)}</b></p>)}</article>)}</div>
      )}
    </section>
  )
}
