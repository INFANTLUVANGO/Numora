import { Calculator, GitCompareArrows, Target } from 'lucide-react'
import type { CalculatorMode } from '../../types/calculator'

const labels = {
  calculate: { label: 'Calculate', icon: Calculator },
  goal: { label: 'Goal', icon: Target },
}

export function ModeTabs({ modes, active, onChange, compareEnabled, onCompareChange, showCompare = true }: { modes: CalculatorMode[]; active: CalculatorMode; onChange: (mode: CalculatorMode) => void; compareEnabled: boolean; onCompareChange: (enabled: boolean) => void; showCompare?: boolean }) {
  return <div className="mode-controls"><div className="mode-tabs" role="tablist">{modes.map((mode) => {
    const Icon = labels[mode].icon
    return <button type="button" role="tab" aria-selected={active === mode} className={active === mode ? 'is-active' : ''} key={mode} onClick={() => onChange(mode)}><Icon size={16} />{labels[mode].label}</button>
  })}</div>{showCompare && <button type="button" className={`compare-toggle${compareEnabled ? ' is-active' : ''}`} aria-pressed={compareEnabled} onClick={() => onCompareChange(!compareEnabled)}><GitCompareArrows size={16} /><span>Compare</span><i aria-hidden="true" /></button>}</div>
}
