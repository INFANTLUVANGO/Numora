import { RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { calculateMoneyFlow } from '../../../calculations/moneyFlow'
import { moneyFlowDefaults, moneyFlowDefinition, moneyFlowInputs, moneyFlowSteps } from '../../../data/moneyFlow'
import type { MoneyFlowInputs } from '../../../types/moneyFlow'
import { isDefined } from '../../../utils/collections'
import { JourneyField } from '../JourneyField'
import { JourneyProgress, JourneyStepActions } from '../JourneyNavigation'
import { MoneyFlowCheckpoint } from './MoneyFlowCheckpoint'
import { MoneyFlowResult } from './MoneyFlowResult'

const coverageOptions = [3, 6, 9, 12]

export function MoneyFlowJourney() {
  const [values, setValues] = useState<MoneyFlowInputs>(moneyFlowDefaults)
  const [goalName, setGoalName] = useState('Travel fund')
  const [stepIndex, setStepIndex] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [baseline, setBaseline] = useState({ debtBalance: moneyFlowDefaults.debtBalance })
  const step = moneyFlowSteps[stepIndex]
  const result = useMemo(() => calculateMoneyFlow(values, goalName), [goalName, values])
  const hasDebt = values.hasHighInterestDebt !== 0
  const hasGoal = values.hasShortTermGoal !== 0
  const visibleInputKeys = (stepIndex === 2 && !hasDebt) || (stepIndex === 3 && !hasGoal) ? [] : step.inputKeys
  const fields = visibleInputKeys
    .map((key) => moneyFlowInputs.find((field) => field.key === key))
    .filter(isDefined)

  const update = (key: keyof MoneyFlowInputs, value: number) => {
    setCompleted(false)
    setValues((current) => ({ ...current, [key]: value }))
  }

  const reset = () => {
    setValues(moneyFlowDefaults)
    setGoalName('Travel fund')
    setStepIndex(0)
    setCompleted(false)
    setBaseline({ debtBalance: moneyFlowDefaults.debtBalance })
  }

  const completeJourney = () => {
    setBaseline({ debtBalance: values.hasHighInterestDebt ? values.debtBalance : 0 })
    setCompleted(true)
    window.setTimeout(() => document.getElementById('money-flow-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const recordProgress = (amount: number) => {
    if (result.priorityId === 'starter-safety' || result.priorityId === 'emergency-fund') {
      setValues((current) => ({ ...current, currentEmergencySavings: Math.min(result.emergencyTarget, current.currentEmergencySavings + amount) }))
      return
    }

    if (result.priorityId === 'high-interest-debt') {
      setValues((current) => {
        const interest = current.debtBalance * (current.debtAnnualRate / 1200)
        const principalPaid = Math.max(0, current.debtMinimumPayment + amount - interest)
        return { ...current, debtBalance: Math.max(0, current.debtBalance - principalPaid) }
      })
      return
    }

    if (result.priorityId === 'short-term-goal') {
      setValues((current) => ({ ...current, goalSaved: Math.min(current.goalTarget, current.goalSaved + amount) }))
    }
  }

  return (
    <>
      <section className="journey-workspace section-shell">
        <div className="journey-workspace__top">
          <div><span className="eyebrow">Selected journey</span><h2>{moneyFlowDefinition.options[0].label}</h2><p>{moneyFlowDefinition.options[0].description}</p></div>
          <div className="journey-workspace__actions"><Link to="/journey">All journeys</Link><button type="button" onClick={reset}><RotateCcw size={14} /> Reset</button></div>
        </div>

        <JourneyProgress steps={moneyFlowSteps} currentIndex={stepIndex} ariaLabel="Money Flow journey progress" onStepChange={setStepIndex} className="journey-progress--four" />

        <div className="journey-builder">
          <div className="journey-step money-flow-step">
            <span className="page-index">STEP {step.number}</span>
            <h2>{step.title}</h2>
            <p>{step.description}</p>

            {stepIndex === 1 && (
              <div className="money-flow-coverage">
                <div><span>EMERGENCY COVERAGE TARGET</span><strong>Choose the number of essential months you want protected.</strong></div>
                <div>{coverageOptions.map((option) => <button className={values.emergencyCoverageMonths === option ? 'is-active' : ''} type="button" onClick={() => update('emergencyCoverageMonths', option)} key={option}>{option} months</button>)}</div>
              </div>
            )}

            {stepIndex === 2 && <MoneyFlowToggle checked={hasDebt} label="I have high-interest debt" description="Credit card, personal loan or another expensive balance." onChange={(checked) => update('hasHighInterestDebt', checked ? 1 : 0)} />}
            {stepIndex === 3 && <MoneyFlowToggle checked={hasGoal} label="I have a short-term goal" description="One target competing for the same monthly money." onChange={(checked) => update('hasShortTermGoal', checked ? 1 : 0)} />}

            {stepIndex === 3 && hasGoal && (
              <label className="journey-field money-flow-goal-name" htmlFor="money-flow-goal-name">
                <span>Goal name</span>
                <input id="money-flow-goal-name" value={goalName} maxLength={40} onChange={(event) => { setGoalName(event.target.value); setCompleted(false) }} />
                <small>For example: Travel fund, course fee or vehicle down payment.</small>
              </label>
            )}

            {fields.length > 0 && <div className="journey-fields">{fields.map((field) => <JourneyField key={field.key} spec={field} value={values[field.key as keyof MoneyFlowInputs]} onChange={(value) => update(field.key as keyof MoneyFlowInputs, value)} />)}</div>}

            <JourneyStepActions
              currentIndex={stepIndex}
              stepCount={moneyFlowSteps.length}
              finalLabel="Build my money order"
              onBack={() => setStepIndex((current) => current - 1)}
              onNext={() => setStepIndex((current) => current + 1)}
              onComplete={completeJourney}
            />
          </div>
          <MoneyFlowCheckpoint stepIndex={stepIndex} result={result} goalName={goalName} />
        </div>
      </section>

      {completed && <div className="money-flow-result-shell section-shell"><MoneyFlowResult result={result} goalName={goalName} baseline={baseline} onRecordProgress={recordProgress} /></div>}
    </>
  )
}

function MoneyFlowToggle({ checked, label, description, onChange }: { checked: boolean; label: string; description: string; onChange: (checked: boolean) => void }) {
  return (
    <div className="money-flow-toggle">
      <div><span>{label}</span><small>{description}</small></div>
      <label><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span aria-hidden="true" /><b>{checked ? 'Yes' : 'No'}</b></label>
    </div>
  )
}
