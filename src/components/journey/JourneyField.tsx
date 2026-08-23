import type { JourneyInputSpec } from '../../types/journey'
import { NumericInput } from '../inputs/NumericInput'

export function JourneyField({ spec, value, onChange }: { spec: JourneyInputSpec; value: number; onChange: (value: number) => void }) {
  return (
    <label className="journey-field" htmlFor={`journey-${spec.key}`}>
      <span>{spec.label}</span>
      <NumericInput id={`journey-${spec.key}`} value={value} onChange={onChange} prefix={spec.prefix} suffix={spec.suffix} min={spec.min} max={spec.max} decimal={spec.decimal} formatThousands={Boolean(spec.prefix)} className="journey-field__input" />
      <small>{spec.hint}</small>
    </label>
  )
}
