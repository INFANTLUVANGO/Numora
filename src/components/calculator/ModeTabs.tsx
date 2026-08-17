import { Calculator, GitCompareArrows, Target } from 'lucide-react'
import type { CalculatorMode } from '../../types/calculator'

const labels = {
  calculate: { label: 'Calculate', icon: Calculator },
  goal: { label: 'Goal', icon: Target },
  compare: { label: 'Compare', icon: GitCompareArrows },
}

export function ModeTabs({ modes, active, onChange }: { modes: CalculatorMode[]; active: CalculatorMode; onChange: (mode: CalculatorMode) => void }) {
  return <div className="mode-tabs" role="tablist">{modes.map((mode) => {
    const Icon = labels[mode].icon
    return <button type="button" role="tab" aria-selected={active === mode} className={active === mode ? 'is-active' : ''} key={mode} onClick={() => onChange(mode)}><Icon size={16} />{labels[mode].label}</button>
  })}</div>
}
