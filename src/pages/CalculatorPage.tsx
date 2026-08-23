import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CalculatorCard } from '../components/common/CalculatorCard'
import { CalculatorForm } from '../components/calculator/CalculatorForm'
import { ModeTabs } from '../components/calculator/ModeTabs'
import { ResultPanel } from '../components/calculator/ResultPanel'
import { TrustRecord } from '../components/calculator/TrustRecord'
import { calculators, getCalculator } from '../data/calculators'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { consumeHandoff, removeScenario, saveScenario, setHandoff } from '../redux/calculatorSlice'
import type { CalculatorMode, CalculatorResult } from '../types/calculator'
import { isDefined } from '../utils/collections'
import { downloadResultPdf } from '../utils/pdf'
import { NotFoundPage } from './NotFoundPage'

function transferInputs(from: string, to: string, resultValue: number, breakdown: CalculatorResult['breakdown'], sourceInputs: Record<string, number>): Record<string, number> {
  if (from === 'salary-calculator' && to === 'monthly-budget-planner') return { monthlyIncome: resultValue }
  if (from === 'monthly-budget-planner' && to === 'emergency-fund-calculator') return { monthlyExpenses: breakdown[0]?.value ?? 0 }
  if (from === 'home-affordability-calculator' && to === 'emi-calculator') return { loanAmount: breakdown[0]?.value ?? 0 }
  if (from === 'emergency-fund-calculator' && to === 'sip-calculator') return { monthlyInvestment: Math.max(1000, (breakdown[1]?.value ?? 0) / 12) }
  if (from === 'lumpsum-calculator' && to === 'swp-calculator') return { initialCorpus: resultValue }
  if (from === 'retirement-calculator' && to === 'swp-calculator') {
    const yearsToRetire = Math.max(0, sourceInputs.retirementAge - sourceInputs.currentAge)
    const monthlyExpensesAtRetirement = sourceInputs.monthlyExpensesAfterRetirement * (1 + (sourceInputs.inflationRate ?? 0) / 100) ** yearsToRetire
    return {
      initialCorpus: breakdown.find((item) => item.label === 'Projected retirement corpus')?.value ?? 0,
      monthlyWithdrawal: monthlyExpensesAtRetirement,
      years: sourceInputs.retirementDuration,
    }
  }
  return {}
}

export function CalculatorPage() {
  const { slug } = useParams()
  const found = getCalculator(slug)
  const calculator = found ?? calculators[0]
  const [mode, setMode] = useState<CalculatorMode>(calculator.modes[0])
  const [values, setValues] = useState<Record<string, number>>(calculator.defaults)
  const [textValues, setTextValues] = useState<Record<string, string>>(calculator.textDefaults ?? {})
  const [handoffApplied, setHandoffApplied] = useState(false)
  const [compareByMode, setCompareByMode] = useState<Record<CalculatorMode, boolean>>({ calculate: false, goal: false })
  const [isFreshScenario, setIsFreshScenario] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const handoff = useAppSelector((state) => state.calculator.handoff)
  const allScenarios = useAppSelector((state) => state.calculator.scenarios)
  const scenarios = useMemo(() => allScenarios.filter((item) => item.calculatorSlug === calculator.slug && item.mode === mode), [allScenarios, calculator.slug, mode])
  const fields = mode === 'goal' && calculator.goalFields ? calculator.goalFields : calculator.fields
  const result = useMemo(() => calculator.calculate(values, mode), [calculator, mode, values])

  useEffect(() => {
    setMode(calculator.modes[0])
    setValues(calculator.defaults)
    setTextValues(calculator.textDefaults ?? {})
    setHandoffApplied(false)
    setCompareByMode({ calculate: false, goal: false })
    setIsFreshScenario(false)
  }, [calculator])

  useEffect(() => {
    if (handoff?.targetSlug === calculator.slug) {
      setValues((current) => ({ ...current, ...handoff.inputs }))
      setHandoffApplied(true)
      dispatch(consumeHandoff())
    }
  }, [calculator.slug, dispatch, handoff])

  if (!found) return <NotFoundPage />

  const compareEnabled = compareByMode[mode]

  const changeMode = (nextMode: CalculatorMode) => {
    setMode(nextMode)
    setValues(nextMode === 'goal' ? (calculator.goalDefaults ?? calculator.defaults) : calculator.defaults)
    setTextValues(calculator.textDefaults ?? {})
    setHandoffApplied(false)
    setIsFreshScenario(false)
  }

  const updateValue = (key: string, value: number) => {
    setIsFreshScenario(false)
    setValues((current) => {
      const next = { ...current, [key]: value }
      if (calculator.slug === 'home-affordability-calculator' && (key === 'monthlySalary' || key === 'totalExpenses')) {
        const monthlySalary = key === 'monthlySalary' ? value : current.monthlySalary
        const totalExpenses = key === 'totalExpenses' ? value : current.totalExpenses
        next.monthlyHomeLoanPayment = Math.max(0, monthlySalary - totalExpenses)
      }
      return next
    })
  }

  const handleRelated = (targetSlug: string) => {
    const inputs = transferInputs(calculator.slug, targetSlug, result.primary.value, result.breakdown, values)
    dispatch(setHandoff({ targetSlug, inputs }))
    navigate(`/calculators/${targetSlug}`)
  }

  const nextStep = calculator.slug === 'home-affordability-calculator'
    ? { eyebrow: 'PLANNING A REAL PURCHASE?', title: 'Test the home against your complete monthly life.', description: 'The Home Journey checks comfort, down-payment readiness and the safety buffer together.', action: 'Start Home Journey', onClick: () => navigate('/journey/home-affordability', { state: { intent: 'check-home' } }) }
    : calculator.slug === 'lumpsum-calculator'
    ? { eyebrow: 'NEXT DECISION', title: 'Turn this corpus into monthly cash flow.', description: 'See how much you could withdraw and what may remain over time.', action: 'Try SWP', onClick: () => handleRelated('swp-calculator') }
    : calculator.slug === 'retirement-calculator'
      ? { eyebrow: 'AFTER RETIREMENT', title: 'See how this corpus may support you.', description: 'Use your projected retirement corpus to model monthly withdrawals and remaining value.', action: 'Plan SWP', onClick: () => handleRelated('swp-calculator') }
      : undefined

  const resetInputs = () => {
    setValues(mode === 'goal' ? (calculator.goalDefaults ?? calculator.defaults) : calculator.defaults)
    setTextValues(calculator.textDefaults ?? {})
    setIsFreshScenario(false)
  }

  const updateTextValue = (key: string, value: string) => {
    setIsFreshScenario(false)
    setTextValues((current) => ({ ...current, [key]: value }))
  }

  const pinCurrentScenario = () => {
    dispatch(saveScenario({ id: crypto.randomUUID(), calculatorSlug: calculator.slug, mode, name: `Plan ${scenarios.length + 1}`, inputs: values, result }))
    const blankValues = Object.fromEntries(fields.map((field) => [field.key, 0]))
    setValues(blankValues)
    setTextValues(Object.fromEntries((calculator.textDefaults ? Object.keys(calculator.textDefaults) : []).map((key) => [key, ''])))
    setIsFreshScenario(true)
  }

  const currentScenario = isFreshScenario ? undefined : { id: 'current', calculatorSlug: calculator.slug, mode, name: 'Current plan', inputs: values, result }

  const related = calculator.related.map((relatedSlug) => getCalculator(relatedSlug)).filter(isDefined)

  return (
    <div className="calculator-page">
      <div className="calculator-mast section-shell">
        <Link className="back-link" to="/calculators"><ArrowLeft size={16} /> Decision desk</Link>
        <div className="calculator-mast__grid">
          <div><span className="page-index">{calculator.category.toUpperCase()} / {calculator.shortTitle.toUpperCase()}</span><h1>{calculator.title}</h1><p>{calculator.description}</p></div>
          <div className={`calculator-mast__badge is-${calculator.accent}`}><span>{calculator.eyebrow}</span><strong>{calculator.question}</strong></div>
        </div>
      </div>

      <section className="calculator-workspace section-shell">
        <ModeTabs modes={calculator.modes} active={mode} onChange={changeMode} compareEnabled={compareEnabled} onCompareChange={(enabled) => setCompareByMode((current) => ({ ...current, [mode]: enabled }))} showCompare={calculator.comparison !== false} />
        {handoffApplied && <div className="handoff-note"><CheckCircle2 size={17} /> A useful value from your previous calculation has been carried into this tool.</div>}
        <div className="calculator-workspace__grid">
          <CalculatorForm fields={fields} values={values} textValues={textValues} onChange={updateValue} onTextChange={updateTextValue} onReset={resetInputs} />
          <ResultPanel result={result} onDownload={() => downloadResultPdf({ ...calculator, fields }, { ...values, ...textValues }, result)} nextStep={nextStep} isFresh={isFreshScenario} comparison={{ enabled: compareEnabled, calculatorLabel: calculator.shortTitle, currentScenario, scenarios, canAdd: !isFreshScenario, onAdd: pinCurrentScenario, onRemove: (id) => dispatch(removeScenario(id)) }} />
        </div>
      </section>

      <div className="section-shell"><TrustRecord calculator={calculator} /></div>

      <section className="related-tools section-shell">
        <div className="section-heading section-heading--split"><div><span className="eyebrow">Continue the journey</span><h2>Use this answer<br />somewhere useful.</h2></div><p>Related tools can carry selected values forward during this visit.</p></div>
        <div className="related-tools__grid">{related.map((item, index) => <div key={item.slug} onClick={(event) => { event.preventDefault(); handleRelated(item.slug) }}><CalculatorCard calculator={item} index={index} compact /></div>)}</div>
        <button className="text-link related-tools__all" type="button" onClick={() => navigate('/calculators')}>See every calculator <ArrowRight size={17} /></button>
      </section>
    </div>
  )
}
