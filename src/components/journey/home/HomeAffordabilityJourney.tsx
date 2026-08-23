import { ArrowRight, GitCompareArrows, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { calculateHomeJourney } from '../../../calculations/homeAffordabilityJourney'
import { homeJourneyDefaults, homeJourneyDefinition, homeJourneyInputs, homeJourneySteps } from '../../../data/journeys'
import { setHandoff } from '../../../redux/calculatorSlice'
import { useAppDispatch } from '../../../redux/hooks'
import type { JourneyAlternative, JourneyIntent } from '../../../types/journey'
import { isDefined } from '../../../utils/collections'
import { JourneyAlternatives } from '../JourneyAlternatives'
import { JourneyCheckpoint } from '../JourneyCheckpoint'
import { JourneySurplusSave } from '../JourneyCushionControl'
import { JourneyDecision } from '../JourneyDecision'
import { JourneyField } from '../JourneyField'
import { JourneyProgress, JourneyStepActions } from '../JourneyNavigation'
import { JourneySurplusNotes } from '../JourneySurplusNotes'

type HomeAffordabilityIntent = Exclude<JourneyIntent, 'buy-vs-rent'>

export function HomeAffordabilityJourney({ intent }: { intent: HomeAffordabilityIntent }) {
  const selectedOption = homeJourneyDefinition.options.find((option) => option.id === intent) ?? homeJourneyDefinition.options[0]
  const [stepIndex, setStepIndex] = useState(0)
  const [values, setValues] = useState(homeJourneyDefaults)
  const [completed, setCompleted] = useState(false)
  const [originalValues, setOriginalValues] = useState<Record<string, number> | null>(null)
  const [activeAlternative, setActiveAlternative] = useState<string | null>(null)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const step = homeJourneySteps[stepIndex]
  const result = useMemo(() => calculateHomeJourney(values, intent), [intent, values])
  const scenarioBase = originalValues ?? values
  const scenarioResult = useMemo(() => calculateHomeJourney(scenarioBase, intent), [intent, scenarioBase])
  const fieldKeys = stepIndex === 1 && intent === 'find-budget' ? step.inputKeys.filter((key) => key !== 'homePrice') : step.inputKeys
  const fields = fieldKeys.map((key) => homeJourneyInputs.find((item) => item.key === key)).filter(isDefined)
  const cushionEnabled = values.monthlyCushionEnabled !== 0
  const cushionPercent = values.monthlyCushionPercent || 25

  const update = (key: string, value: number) => {
    setActiveAlternative(null)
    setValues((current) => ({ ...current, [key]: value }))
  }

  const reset = () => {
    setValues(homeJourneyDefaults)
    setStepIndex(0)
    setCompleted(false)
    setOriginalValues(null)
    setActiveAlternative(null)
  }

  const completeJourney = () => {
    setCompleted(true)
    setOriginalValues({ ...values })
    setActiveAlternative(null)
    window.setTimeout(() => document.getElementById('decision')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const applyAlternative = (alternative: JourneyAlternative) => {
    setValues({ ...scenarioBase, ...alternative.changes })
    setActiveAlternative(alternative.id)
  }

  const restoreOriginal = () => {
    if (originalValues) setValues(originalValues)
    setActiveAlternative(null)
  }

  const openCalculator = (slug: string, inputs?: Record<string, number>) => {
    const transfer = inputs ?? { loanAmount: result.loanAmount, annualRate: values.annualRate, years: values.years }
    dispatch(setHandoff({ targetSlug: slug, inputs: transfer }))
    navigate(`/calculators/${slug}`)
  }

  const compareWithRent = () => {
    if (!completed) return
    navigate(`/journey/${homeJourneyDefinition.slug}`, {
      state: {
        intent: 'buy-vs-rent',
        source: 'affordability',
        carriedValues: {
          homePrice: result.homePrice,
          downPaymentAmount: result.downPayment,
          annualRate: values.annualRate,
          years: values.years,
        },
      },
    })
  }

  return (
    <>
      <section className="journey-workspace section-shell">
        <div className="journey-workspace__top">
          <div><span className="eyebrow">Selected approach</span><h2>{selectedOption.label}</h2><p>{selectedOption.description}</p></div>
          <div className="journey-workspace__actions"><Link to="/journey">Change approach</Link><button type="button" onClick={reset}><RotateCcw size={14} /> Reset</button></div>
        </div>

        <JourneyProgress steps={homeJourneySteps} currentIndex={stepIndex} ariaLabel="Journey progress" onStepChange={setStepIndex} />

        <div className="journey-builder">
          <div className="journey-step">
            <span className="page-index">STEP {step.number}</span>
            <h2>{step.title}</h2>
            <p>{step.description}</p>
            <div className="journey-fields">{fields.map((field) => <JourneyField key={field.key} spec={field} value={values[field.key]} onChange={(value) => update(field.key, value)} />)}</div>
            {stepIndex === 1 && intent === 'find-budget' && <JourneySurplusSave enabled={cushionEnabled} percent={cushionPercent} onToggle={(enabled) => update('monthlyCushionEnabled', enabled ? 1 : 0)} onPercentChange={(percent) => update('monthlyCushionPercent', percent)} />}
            <JourneyStepActions
              currentIndex={stepIndex}
              stepCount={homeJourneySteps.length}
              finalLabel="See my decision"
              onBack={() => setStepIndex((current) => current - 1)}
              onNext={() => setStepIndex((current) => current + 1)}
              onComplete={completeJourney}
            />
          </div>
          <JourneyCheckpoint stepIndex={stepIndex} result={result} intent={intent} />
        </div>

        {intent === 'check-home' && (
          <div id="rent-comparison-bridge" className={`journey-rent-bridge ${completed ? 'is-ready' : ''}`}>
            <div className="journey-rent-bridge__icon"><GitCompareArrows size={20} /></div>
            <div><strong>Compare this home with renting.</strong><span>{completed ? 'Home amount, down payment, interest and tenure are ready to carry.' : 'Complete this home calculation to carry its values into EMI vs Rent.'}</span></div>
            <button type="button" disabled={!completed} title={completed ? 'Carry this completed home plan into EMI vs Rent' : 'Complete the calculation first'} onClick={compareWithRent}>Carry values & compare <ArrowRight size={16} /></button>
          </div>
        )}
      </section>

      {completed && (
        <>
          <div id="decision" className="journey-result section-shell"><JourneyDecision result={result} onOpenCalculator={openCalculator} /></div>
          <div className="section-shell"><JourneyAlternatives alternatives={scenarioResult.alternatives} activeId={activeAlternative} onApply={applyAlternative} onRestore={restoreOriginal} /></div>
          <JourneySurplusNotes result={result} onOpenCalculator={openCalculator} />
          <p className="journey-disclaimer section-shell">Educational estimate based on your entries—not lending approval or financial advice. The down payment is assumed available; the SIP and emergency-fund figures are illustrative alternatives, not simultaneous commitments.</p>
        </>
      )}
    </>
  )
}
