import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CalculatorDefinition } from '../../types/calculator'
import { NumoraIcon } from './NumoraIcon'

export function CalculatorCard({ calculator, index, compact = false }: { calculator: CalculatorDefinition; index?: number; compact?: boolean }) {
  return (
    <Link className={`tool-card tool-card--${calculator.accent}${compact ? ' tool-card--compact' : ''}`} to={`/calculators/${calculator.slug}`}>
      <div className="tool-card__top">
        <span className="tool-card__index">{String((index ?? 0) + 1).padStart(2, '0')}</span>
        <span className="tool-card__icon"><NumoraIcon name={calculator.icon} /></span>
      </div>
      <div className="tool-card__body">
        <span className="eyebrow">{calculator.category}</span>
        <h3>{calculator.shortTitle}</h3>
        {!compact && <p>{calculator.description}</p>}
      </div>
      <ArrowUpRight className="tool-card__arrow" size={19} aria-hidden="true" />
    </Link>
  )
}
