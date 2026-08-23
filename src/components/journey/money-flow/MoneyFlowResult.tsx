import { AlertTriangle, ArrowDown, Check, CircleDollarSign, Clock3, Route, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { MoneyFlowPriorityId, MoneyFlowResult as MoneyFlowResultType } from '../../../types/moneyFlow'
import { formatCompactCurrency, formatCurrency } from '../../../utils/formatters'
import { NumericInput } from '../../inputs/NumericInput'

interface ProgressBaseline {
  debtBalance: number
}

interface MoneyFlowResultProps {
  result: MoneyFlowResultType
  goalName: string
  baseline: ProgressBaseline
  onRecordProgress: (amount: number) => void
}

const formatMonths = (months: number | null) => {
  if (months === null) return 'Needs a larger payment'
  if (months === 0) return 'Already complete'
  if (months < 12) return `${months} month${months === 1 ? '' : 's'}`
  const years = Math.floor(months / 12)
  const remaining = months % 12
  return remaining === 0 ? `${years} year${years === 1 ? '' : 's'}` : `${years}y ${remaining}m`
}

const trackablePriorities: MoneyFlowPriorityId[] = ['starter-safety', 'high-interest-debt', 'emergency-fund', 'short-term-goal']

export function MoneyFlowResult({ result, goalName, baseline, onRecordProgress }: MoneyFlowResultProps) {
  const [actualAmount, setActualAmount] = useState(result.currentMonthlyAllocation)
  const isShortfall = result.priorityId === 'shortfall'
  const canTrack = trackablePriorities.includes(result.priorityId)
  const cleanedGoalName = goalName.trim() || 'Short-term goal'

  const progressItems = useMemo(() => {
    const items = []
    if (result.emergencyTarget > 0) {
      items.push({
        id: 'emergency',
        label: 'Emergency fund',
        detail: `${formatCompactCurrency(result.currentEmergencySavings)} of ${formatCompactCurrency(result.emergencyTarget)}`,
        percentage: Math.min(100, (result.currentEmergencySavings / result.emergencyTarget) * 100),
      })
    }
    if (baseline.debtBalance > 0) {
      items.push({
        id: 'debt',
        label: 'High-interest debt cleared',
        detail: `${formatCompactCurrency(result.debtBalance)} remaining`,
        percentage: Math.min(100, Math.max(0, ((baseline.debtBalance - result.debtBalance) / baseline.debtBalance) * 100)),
      })
    }
    if (result.goalTarget > 0) {
      items.push({
        id: 'goal',
        label: cleanedGoalName,
        detail: `${formatCompactCurrency(result.goalSaved)} of ${formatCompactCurrency(result.goalTarget)}`,
        percentage: Math.min(100, (result.goalSaved / result.goalTarget) * 100),
      })
    }
    return items
  }, [baseline.debtBalance, cleanedGoalName, result])

  const recordProgress = () => {
    if (actualAmount <= 0) return
    onRecordProgress(actualAmount)
    setActualAmount(0)
  }

  return (
    <section id="money-flow-result" className={`money-flow-result ${isShortfall ? 'money-flow-result--shortfall' : ''}`}>
      <header className="money-flow-result__signal">
        <div>{isShortfall ? <AlertTriangle size={20} /> : <Route size={20} />}</div>
        <span>YOUR NUMORA MONEY ORDER</span>
        <strong>{isShortfall ? 'REPAIR CASH FLOW' : 'PLAN READY'}</strong>
      </header>

      <div className="money-flow-result__hero">
        <div><span className="page-index">YOUR NEXT PRIORITY</span><h2>{result.priorityTitle}</h2><p>{result.priorityDescription}</p></div>
        <div className="money-flow-result__available">
          <span>{isShortfall ? 'Monthly gap' : 'Available to direct'}</span>
          <strong>{formatCompactCurrency(isShortfall ? result.monthlyShortfall : result.availableMoney)}</strong>
          <small>after current entries</small>
        </div>
      </div>

      <div className="money-flow-result__metrics">
        <dl><dt>Emergency cover</dt><dd>{result.currentEmergencyCoverage.toFixed(1)} months</dd></dl>
        <dl><dt>High-interest debt</dt><dd>{result.debtBalance > 0 ? formatCompactCurrency(result.debtBalance) : 'None entered'}</dd></dl>
        <dl><dt>{cleanedGoalName}</dt><dd>{result.goalTarget > 0 ? `${formatCompactCurrency(result.goalRemaining)} left` : 'Not added'}</dd></dl>
        <dl><dt>Future monthly investing</dt><dd>{formatCompactCurrency(result.futureMonthlyInvestment)}</dd></dl>
      </div>

      {isShortfall ? (
        <div className="money-flow-recovery">
          <div className="money-flow-section-head"><span>01 / RECOVERY ORDER</span><h3>Balance the month before funding another target.</h3></div>
          <div className="money-flow-recovery__steps">
            {result.recovery.reduceExistingInvestmentsBy > 0 && <article><b>01</b><div><span>Review existing investments</span><strong>{formatCurrency(result.recovery.reduceExistingInvestmentsBy)} / month</strong><p>Temporarily adjusting this amount can protect required expenses and payments.</p></div></article>}
            {result.recovery.reduceFlexibleSpendingBy > 0 && <article><b>02</b><div><span>Review flexible spending</span><strong>{formatCurrency(result.recovery.reduceFlexibleSpendingBy)} / month</strong><p>This is the adjustable spending entered, not essential expenses.</p></div></article>}
            {result.recovery.unresolvedShortfall > 0
              ? <article className="is-warning"><b>!</b><div><span>Gap still unresolved</span><strong>{formatCurrency(result.recovery.unresolvedShortfall)} / month</strong><p>The entered income cannot yet cover essential costs and required payments.</p></div></article>
              : <article className="is-complete"><b><Check size={15} /></b><div><span>Cash flow can be balanced</span><strong>Monthly gap covered</strong><p>Apply the two reviews above before starting the priority plan.</p></div></article>}
          </div>
        </div>
      ) : (
        <>
          <div className="money-flow-allocation">
            <div className="money-flow-section-head"><span>01 / THIS MONTH</span><h3>Give the available money one job.</h3></div>
            <div className="money-flow-allocation__card">
              <div><CircleDollarSign size={22} /><span>Direct now</span></div>
              <strong>{formatCompactCurrency(result.currentMonthlyAllocation)}</strong>
              <p>{result.priorityTitle}</p>
              {result.priorityId === 'high-interest-debt' && <small>This is above the {formatCompactCurrency(result.debtMinimumPayment)} required payment already counted.</small>}
              {result.priorityId === 'investing' && <small>Your completed priorities leave {formatCompactCurrency(result.futureMonthlyInvestment)} for monthly investing.</small>}
            </div>
          </div>

          {result.phases.length > 0 && (
            <div className="money-flow-path">
              <div className="money-flow-section-head"><span>02 / MONEY PATH</span><h3>Each completed stage releases money into the next.</h3></div>
              <div className="money-flow-path__line">
                {result.phases.map((phase, index) => (
                  <article className={index === 0 ? 'is-current' : ''} key={`${phase.id}-${phase.startMonth}`}>
                    <div className="money-flow-path__marker"><span>{index + 1}</span>{index < result.phases.length - 1 && <ArrowDown size={16} />}</div>
                    <div className="money-flow-path__content">
                      <span>{index === 0 ? 'DO THIS NOW' : phase.ongoing ? 'THEN, ONGOING' : `THEN, FROM MONTH ${phase.startMonth}`}</span>
                      <h4>{phase.title}</h4>
                      <p>{phase.description}</p>
                      <div><b>{formatCompactCurrency(phase.totalMonthlyPayment ?? phase.monthlyAllocation)} / month</b><small>{phase.totalMonthlyPayment ? `${formatCompactCurrency(phase.monthlyAllocation)} extra above the required payment` : phase.ongoing ? 'Ongoing' : formatMonths(phase.durationMonths)}</small></div>
                    </div>
                  </article>
                ))}
              </div>
              {result.goalOnTime === false && result.goalMonths > 0 && <div className="money-flow-goal-warning"><Clock3 size={18} /><span><strong>The entered goal date needs attention.</strong> This order reaches {cleanedGoalName} around month {result.goalProjectedCompletionMonth ?? '—'}, after the requested {result.goalMonths} months.</span></div>}
            </div>
          )}

          {progressItems.length > 0 && (
            <div className="money-flow-progress-panel">
              <div className="money-flow-section-head"><span>03 / PROGRESS</span><h3>What is already built.</h3></div>
              <div className="money-flow-progress-panel__grid">
                {progressItems.map((item) => <article key={item.id}><div><span>{item.label}</span><strong>{Math.round(item.percentage)}%</strong></div><div className="money-flow-progress-panel__track"><i style={{ width: `${item.percentage}%` }} /></div><small>{item.detail}</small></article>)}
              </div>
            </div>
          )}

          {canTrack && (
            <div className="money-flow-update">
              <div><span>SESSION PROGRESS</span><h3>Record what you actually moved.</h3><p>Planned now: {formatCompactCurrency(result.currentMonthlyAllocation)}. This update stays only until the page is refreshed.</p></div>
              <div className="money-flow-update__control">
                <NumericInput id="money-flow-actual" value={actualAmount} onChange={setActualAmount} prefix="₹" min={0} formatThousands className="journey-field__input" />
                <button type="button" onClick={recordProgress}>Update this plan</button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="money-flow-rules">
        <div><ShieldCheck size={20} /><span><strong>How NUMORA ordered this</strong><small>Transparent rules, not a hidden score.</small></span></div>
        <ol>{result.rules.map((rule) => <li key={rule}>{rule}</li>)}</ol>
      </div>
      <p className="money-flow-result__note">Educational planning estimate based only on the values entered. Returns, taxes, penalties and personal risk needs are not included.</p>
    </section>
  )
}
