import { Link2, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { calculateBuyVsRent } from '../../../calculations/buyVsRent'
import { buyVsRentInputs, buyVsRentSteps, fixedRentalOptions } from '../../../data/buyVsRent'
import type { BuyVsRentInputs } from '../../../types/buyVsRent'
import { isDefined } from '../../../utils/collections'
import { JourneyField } from '../JourneyField'
import { JourneyProgress, JourneyStepActions } from '../JourneyNavigation'
import { BuyVsRentCheckpoint } from './BuyVsRentCheckpoint'
import { BuyVsRentResult } from './BuyVsRentResult'

export function BuyVsRentJourney({ initialValues, carried }: { initialValues: BuyVsRentInputs; carried: boolean }) {
  const [values, setValues] = useState(initialValues)
  const [stepIndex, setStepIndex] = useState(0)
  const [completed, setCompleted] = useState(false)
  const step = buyVsRentSteps[stepIndex]
  const fields = step.inputKeys.map((key) => buyVsRentInputs.find((field) => field.key === key)).filter(isDefined)
  const result = useMemo(() => calculateBuyVsRent(values, fixedRentalOptions), [values])

  const update = (key: keyof BuyVsRentInputs, value: number) => {
    setCompleted(false)
    setValues((current) => ({ ...current, [key]: value }))
  }

  const reset = () => {
    setValues(initialValues)
    setStepIndex(0)
    setCompleted(false)
  }

  const calculate = () => {
    setCompleted(true)
    window.setTimeout(() => document.getElementById('buy-rent-decision')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <>
      <section className="journey-workspace section-shell">
        <div className="journey-workspace__top">
          <div><span className="eyebrow">Selected approach</span><h2>Buy this home or rent?</h2><p>Compare one home loan with renting and investing the monthly difference.</p></div>
          <div className="journey-workspace__actions"><Link to="/journey">Change approach</Link><button type="button" onClick={reset}><RotateCcw size={14} /> Reset</button></div>
        </div>

        {carried && <div className="buy-rent-carried"><Link2 size={18} /><div><strong>Home plan carried from your affordability result.</strong><span>You can edit this comparison without changing the earlier result.</span></div></div>}

        <JourneyProgress steps={buyVsRentSteps} currentIndex={stepIndex} ariaLabel="EMI versus rent progress" onStepChange={setStepIndex} />

        <div className="journey-builder">
          <div className="journey-step">
            <span className="page-index">STEP {step.number}</span>
            <h2>{step.title}</h2>
            <p>{step.description}</p>
            <div className="journey-fields">{fields.map((field) => <JourneyField key={field.key} spec={field} value={values[field.key as keyof BuyVsRentInputs]} onChange={(value) => update(field.key as keyof BuyVsRentInputs, value)} />)}</div>
            <JourneyStepActions
              currentIndex={stepIndex}
              stepCount={buyVsRentSteps.length}
              finalLabel="Calculate"
              onBack={() => setStepIndex((current) => current - 1)}
              onNext={() => setStepIndex((current) => current + 1)}
              onComplete={calculate}
            />
          </div>
          <BuyVsRentCheckpoint stepIndex={stepIndex} result={result} />
        </div>
      </section>

      {completed && <div id="buy-rent-decision" className="buy-rent-result-shell section-shell"><BuyVsRentResult result={result} /></div>}
    </>
  )
}
