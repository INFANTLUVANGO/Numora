import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import type { JourneyStepSpec } from '../../types/journey'

interface JourneyProgressProps {
  steps: JourneyStepSpec[]
  currentIndex: number
  ariaLabel: string
  onStepChange: (index: number) => void
  className?: string
}

interface JourneyStepActionsProps {
  currentIndex: number
  stepCount: number
  finalLabel: string
  onBack: () => void
  onNext: () => void
  onComplete: () => void
}

export function JourneyProgress({ steps, currentIndex, ariaLabel, onStepChange, className = '' }: JourneyProgressProps) {
  return (
    <div className={`journey-progress${className ? ` ${className}` : ''}`} aria-label={ariaLabel}>
      {steps.map((step, index) => (
        <button
          key={step.number}
          type="button"
          className={index === currentIndex ? 'is-active' : index < currentIndex ? 'is-complete' : ''}
          onClick={() => onStepChange(index)}
        >
          <span>{index < currentIndex ? <Check size={15} /> : step.number}</span>
          <strong>{step.eyebrow}</strong>
        </button>
      ))}
    </div>
  )
}

export function JourneyStepActions({ currentIndex, stepCount, finalLabel, onBack, onNext, onComplete }: JourneyStepActionsProps) {
  const isLastStep = currentIndex === stepCount - 1

  return (
    <div className="journey-step__actions">
      {currentIndex > 0 && <button className="secondary-button" type="button" onClick={onBack}><ArrowLeft size={16} /> Back</button>}
      <button className="primary-button" type="button" onClick={isLastStep ? onComplete : onNext}>
        {isLastStep ? finalLabel : 'Continue'} <ArrowRight size={16} />
      </button>
    </div>
  )
}
