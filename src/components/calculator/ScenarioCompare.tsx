import { Pin, Plus, Trash2 } from 'lucide-react'
import type { CalculatorResult, ResultItem, SavedScenario } from '../../types/calculator'
import { formatResult } from '../../utils/formatters'

function item(result: CalculatorResult, label: string): ResultItem | undefined {
  return result.breakdown.find((entry) => entry.label === label)
}

function display(entry: ResultItem | undefined) {
  return entry ? entry.displayValue ?? formatResult(entry.value, entry.kind) : '—'
}

function metric(label: string, value: number, kind: ResultItem['kind'] = 'number', displayValue?: string): ResultItem {
  return { label, value, kind, displayValue }
}

function withDetail(entry: ResultItem | undefined, label: string, detail: string, fallbackKind: ResultItem['kind'] = 'number'): ResultItem {
  const value = entry ?? metric(label, 0, fallbackKind)
  return { ...value, label, displayValue: `${display(value)} (${detail})` }
}

function scenarioMetrics(scenario: SavedScenario): ResultItem[] {
  const { result, inputs } = scenario
  const annualRate = inputs.annualRate ?? 0

  switch (scenario.calculatorSlug) {
    case 'sip-calculator': {
      const stepUp = inputs.stepUpRate ?? 0
      const monthly = scenario.mode === 'goal'
        ? result.primary
        : metric('Monthly SIP', inputs.monthlyInvestment ?? 0, 'currency')
      return [
        { ...monthly, label: stepUp > 0 ? `Monthly SIP · +${stepUp}% yearly` : 'Monthly SIP' },
        item(result, 'Total invested') ?? metric('Total invested', 0, 'currency'),
        metric('Duration', inputs.years ?? 0, 'years', `${inputs.years ?? 0} years · ${annualRate}%/yr`),
      ]
    }
    case 'lumpsum-calculator':
      return [item(result, 'Initial investment') ?? metric('Initial investment', 0, 'currency'), withDetail(item(result, 'Estimated gains'), 'Estimated gains', `${annualRate}%/yr`, 'currency'), metric('Duration', inputs.years ?? 0, 'years', `${inputs.years ?? 0} years`)]
    case 'swp-calculator':
      return [item(result, 'Total withdrawn') ?? metric('Total withdrawn', 0, 'currency'), withDetail(item(result, 'Estimated investment growth'), 'Investment growth', `${annualRate}%/yr`, 'currency'), withDetail(item(result, 'Monthly withdrawal'), 'Monthly withdrawal', `+${inputs.withdrawalIncrease ?? 0}% yearly`, 'currency')]
    case 'emi-calculator':
      return [item(result, 'Principal') ?? metric('Principal', 0, 'currency'), withDetail(item(result, 'Total interest'), 'Total interest', `${annualRate}%/yr`, 'currency'), metric('Tenure', inputs.years ?? 0, 'years', `${inputs.years ?? 0} years`)]
    case 'home-affordability-calculator':
      return [withDetail(item(result, 'Indicative loan'), 'Indicative loan', `${annualRate}%/yr`, 'currency'), item(result, 'Down payment') ?? metric('Down payment', 0, 'currency'), withDetail(item(result, 'Monthly home-loan payment'), 'Monthly loan payment', `${inputs.years ?? 0} years`, 'currency')]
    case 'salary-calculator':
      return [item(result, 'Annual fixed cash salary') ?? metric('Annual fixed salary', 0, 'currency'), item(result, 'Annual bonus paid separately') ?? metric('Annual bonus', 0, 'currency'), item(result, 'Total annual compensation') ?? metric('Total compensation', 0, 'currency')]
    case 'monthly-budget-planner':
      return [item(result, 'Total spending') ?? metric('Total spending', 0, 'currency'), item(result, 'Savings rate') ?? metric('Savings rate', 0, 'percentage'), item(result, 'EMI share of income') ?? metric('EMI share', 0, 'percentage')]
    case 'emergency-fund-calculator':
      return [item(result, 'Current emergency savings') ?? metric('Current savings', 0, 'currency'), item(result, 'Remaining amount') ?? metric('Remaining', 0, 'currency'), item(result, 'Funding progress') ?? metric('Funding progress', 0, 'percentage')]
    case 'retirement-calculator':
      return [withDetail(item(result, 'Retirement corpus needed'), 'Corpus needed', `${inputs.inflationRate ?? 0}% inflation`, 'currency'), withDetail(item(result, 'Projected retirement corpus'), 'Projected corpus', `${annualRate}%/yr return`, 'currency'), item(result, 'Monthly investment needed') ?? metric('Monthly investment needed', 0, 'currency')]
    case 'travel-budget-planner':
      return [item(result, 'Cost per person') ?? metric('Cost per person', 0, 'currency'), item(result, 'Daily cost per person') ?? metric('Daily cost per person', 0, 'currency'), item(result, 'Recommended monthly saving') ?? metric('Monthly saving', 0, 'currency')]
    case 'fuel-trip-calculator':
      return [item(result, 'Fuel cost') ?? metric('Fuel cost', 0, 'currency'), item(result, 'Cost per traveller') ?? metric('Cost per traveller', 0, 'currency'), item(result, 'Fuel required') ?? metric('Fuel required', 0, 'number')]
    default:
      return result.breakdown.slice(0, 3)
  }
}

function ScenarioNote({ scenario, index, current, onRemove }: { scenario: SavedScenario; index: number; current?: boolean; onRemove?: (id: string) => void }) {
  const metrics = scenarioMetrics(scenario)
  return <article className={`pinned-note${current ? ' is-current' : ''}`}>
    <div className="pinned-note__top"><span><Pin size={12} /> {current ? 'CURRENT PLAN' : `PLAN ${String(index + 1).padStart(2, '0')}`}</span>{onRemove && <button type="button" onClick={() => onRemove(scenario.id)} aria-label={`Remove ${scenario.name}`}><Trash2 size={14} /></button>}</div>
    <small>{scenario.result.primary.label}</small>
    <strong>{display(scenario.result.primary)}</strong>
    <div className="pinned-note__metrics">{metrics.map((entry) => <p key={entry.label}><span>{entry.label}</span><b>{display(entry)}</b></p>)}</div>
  </article>
}

export function PinnedComparison({ calculatorLabel, currentScenario, scenarios, canAdd, onAdd, onRemove }: { calculatorLabel: string; currentScenario?: SavedScenario; scenarios: SavedScenario[]; canAdd: boolean; onAdd: () => void; onRemove: (id: string) => void }) {
  return (
    <section className="pinned-comparison" aria-label={`Compare your ${calculatorLabel} plans`}>
      <div className="pinned-comparison__head">
        <strong>Compare your {calculatorLabel} plans</strong>
        <button className="pin-result-button" type="button" onClick={onAdd} disabled={!canAdd} aria-label="Add comparison plan"><Plus size={19} /></button>
      </div>
      <div className="pinned-comparison__rail">
        {currentScenario && <ScenarioNote scenario={currentScenario} index={0} current />}
        {scenarios.map((scenario, index) => <ScenarioNote key={scenario.id} scenario={scenario} index={index} onRemove={scenarios.length > 1 ? onRemove : undefined} />)}
        {!currentScenario && scenarios.length === 0 && <button className="pinned-note pinned-note--add" type="button" onClick={onAdd} disabled={!canAdd} aria-label="Add comparison plan"><Plus size={22} /></button>}
      </div>
    </section>
  )
}
