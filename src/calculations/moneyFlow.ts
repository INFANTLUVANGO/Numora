import type { MoneyFlowInputs, MoneyFlowPhase, MoneyFlowPriorityId, MoneyFlowResult } from '../types/moneyFlow'
import { formatCompactCurrency } from '../utils/formatters'
import { annualPercentageToMonthlyRate, toNonNegativeNumber } from './helpers'

function estimateDebtPayoff(balance: number, annualRate: number, monthlyPayment: number) {
  if (balance <= 0) return 0
  if (monthlyPayment <= 0) return null

  const monthlyRate = annualPercentageToMonthlyRate(annualRate)
  let remaining = balance

  for (let month = 1; month <= 600; month += 1) {
    const monthlyInterest = remaining * monthlyRate
    if (monthlyPayment <= monthlyInterest) return null
    const payment = Math.min(monthlyPayment, remaining + monthlyInterest)
    remaining -= payment - monthlyInterest
    if (remaining <= 0.01) return month
  }

  return null
}

export function calculateMoneyFlow(rawInputs: MoneyFlowInputs, goalName = 'Short-term goal'): MoneyFlowResult {
  const monthlyIncome = toNonNegativeNumber(rawInputs.monthlyIncome)
  const essentialExpenses = toNonNegativeNumber(rawInputs.essentialExpenses)
  const flexibleExpenses = toNonNegativeNumber(rawInputs.flexibleExpenses)
  const otherEmis = toNonNegativeNumber(rawInputs.otherEmis)
  const existingInvestments = toNonNegativeNumber(rawInputs.existingInvestments)
  const currentEmergencySavings = toNonNegativeNumber(rawInputs.currentEmergencySavings)
  const emergencyCoverageMonths = Math.min(12, Math.max(3, Math.round(toNonNegativeNumber(rawInputs.emergencyCoverageMonths) || 6)))
  const hasDebt = rawInputs.hasHighInterestDebt !== 0 && toNonNegativeNumber(rawInputs.debtBalance) > 0
  const debtBalance = hasDebt ? toNonNegativeNumber(rawInputs.debtBalance) : 0
  const debtAnnualRate = hasDebt ? toNonNegativeNumber(rawInputs.debtAnnualRate) : 0
  const debtMinimumPayment = hasDebt ? toNonNegativeNumber(rawInputs.debtMinimumPayment) : 0
  const hasGoal = rawInputs.hasShortTermGoal !== 0 && toNonNegativeNumber(rawInputs.goalTarget) > 0
  const goalTarget = hasGoal ? toNonNegativeNumber(rawInputs.goalTarget) : 0
  const goalSaved = hasGoal ? Math.min(goalTarget, toNonNegativeNumber(rawInputs.goalSaved)) : 0
  const goalMonths = hasGoal ? Math.round(toNonNegativeNumber(rawInputs.goalMonths)) : 0

  const monthlyCashFlowBeforeInvesting = monthlyIncome - essentialExpenses - flexibleExpenses - otherEmis - debtMinimumPayment
  const rawAvailableMoney = monthlyCashFlowBeforeInvesting - existingInvestments
  const availableMoney = Math.abs(rawAvailableMoney) < 1 ? 0 : rawAvailableMoney
  const monthlyShortfall = Math.max(0, -availableMoney)
  const essentialCommitments = essentialExpenses + otherEmis + debtMinimumPayment
  const emergencyTarget = essentialCommitments * emergencyCoverageMonths
  const starterEmergencyTarget = Math.min(emergencyTarget, essentialCommitments)
  const emergencyRemaining = Math.max(0, emergencyTarget - currentEmergencySavings)
  const currentEmergencyCoverage = essentialCommitments > 0 ? currentEmergencySavings / essentialCommitments : emergencyCoverageMonths
  const goalRemaining = Math.max(0, goalTarget - goalSaved)
  const reduceExistingInvestmentsBy = Math.min(existingInvestments, monthlyShortfall)
  const shortfallAfterInvestments = Math.max(0, monthlyShortfall - reduceExistingInvestmentsBy)
  const reduceFlexibleSpendingBy = Math.min(flexibleExpenses, shortfallAfterInvestments)
  const unresolvedShortfall = Math.max(0, shortfallAfterInvestments - reduceFlexibleSpendingBy)

  const rules = [
    'Only money left after expenses, minimum debt payments and existing investments is allocated.',
    'A one-month essential buffer is built before extra payments toward high-interest debt.',
    'After expensive debt is cleared, its minimum payment is released into the next priority.',
    'The remaining emergency target and short-term goal are completed before new long-term investing.',
  ]

  if (monthlyShortfall > 0) {
    const priorityDescription = reduceExistingInvestmentsBy >= monthlyShortfall
      ? `Existing investments exceed the monthly room by ${formatCompactCurrency(monthlyShortfall)}. Review that amount before funding another priority.`
      : `Close the ${formatCompactCurrency(monthlyShortfall)} gap before allocating money to emergency savings, debt acceleration or a new goal.`

    return {
      debtMinimumPayment, monthlyCashFlowBeforeInvesting, availableMoney, monthlyShortfall,
      emergencyTarget, currentEmergencySavings, emergencyRemaining,
      emergencyCoverageMonths, currentEmergencyCoverage, debtBalance,
      goalTarget, goalSaved, goalRemaining, goalMonths, goalProjectedCompletionMonth: null,
      goalOnTime: goalMonths > 0 ? false : null, priorityId: 'shortfall',
      priorityTitle: `Fix the ${formatCompactCurrency(monthlyShortfall)} monthly shortfall first.`, priorityDescription,
      currentMonthlyAllocation: 0, futureMonthlyInvestment: Math.max(0, existingInvestments - reduceExistingInvestmentsBy), phases: [],
      recovery: { reduceExistingInvestmentsBy, reduceFlexibleSpendingBy, unresolvedShortfall }, rules,
    }
  }

  if (availableMoney <= 0) {
    const hasOpenTarget = emergencyRemaining > 0 || debtBalance > 0 || goalRemaining > 0
    return {
      debtMinimumPayment, monthlyCashFlowBeforeInvesting, availableMoney, monthlyShortfall,
      emergencyTarget, currentEmergencySavings, emergencyRemaining,
      emergencyCoverageMonths, currentEmergencyCoverage, debtBalance,
      goalTarget, goalSaved, goalRemaining, goalMonths, goalProjectedCompletionMonth: null,
      goalOnTime: goalMonths > 0 ? false : null, priorityId: hasOpenTarget ? 'create-room' : 'investing',
      priorityTitle: hasOpenTarget ? 'Create monthly room for the next priority.' : 'Your current plan is fully allocated.',
      priorityDescription: hasOpenTarget ? 'No unallocated monthly money remains after the commitments and investments entered.' : 'There are no unfinished safety, debt or short-term targets in this plan.',
      currentMonthlyAllocation: 0, futureMonthlyInvestment: existingInvestments,
      phases: [], recovery: { reduceExistingInvestmentsBy: 0, reduceFlexibleSpendingBy: 0, unresolvedShortfall: 0 }, rules,
    }
  }

  const phases: MoneyFlowPhase[] = []
  let monthCursor = 1
  let monthlyPool = availableMoney
  let emergencyBalance = currentEmergencySavings
  let timelineBlocked = false

  const addSavingsPhase = (id: 'starter-safety' | 'emergency-fund' | 'short-term-goal', title: string, description: string, remainingTarget: number) => {
    if (remainingTarget <= 0 || monthlyPool <= 0 || timelineBlocked) return
    const durationMonths = Math.max(1, Math.ceil(remainingTarget / monthlyPool))
    phases.push({ id, title, description, monthlyAllocation: monthlyPool, remainingTarget, durationMonths, startMonth: monthCursor, endMonth: monthCursor + durationMonths - 1 })
    monthCursor += durationMonths
  }

  const starterRemaining = Math.max(0, starterEmergencyTarget - emergencyBalance)
  if (starterRemaining > 0) {
    addSavingsPhase('starter-safety', 'Build one month of safety', 'Create a starter buffer before sending extra money toward expensive debt.', starterRemaining)
    emergencyBalance += starterRemaining
  }

  if (debtBalance > 0 && !timelineBlocked) {
    const totalMonthlyPayment = debtMinimumPayment + monthlyPool
    const payoffMonths = estimateDebtPayoff(debtBalance, debtAnnualRate, totalMonthlyPayment)
    phases.push({
      id: 'high-interest-debt',
      title: 'Clear high-interest debt',
      description: payoffMonths === null ? 'The entered payment does not reduce this balance reliably. A larger monthly payment is needed.' : 'Add the available monthly amount above the minimum payment until the balance is cleared.',
      monthlyAllocation: monthlyPool,
      totalMonthlyPayment,
      remainingTarget: debtBalance,
      durationMonths: payoffMonths,
      startMonth: monthCursor,
      endMonth: payoffMonths === null ? null : monthCursor + payoffMonths - 1,
    })
    if (payoffMonths === null) timelineBlocked = true
    else {
      monthCursor += payoffMonths
      monthlyPool += debtMinimumPayment
    }
  }

  const fullEmergencyRemaining = Math.max(0, emergencyTarget - emergencyBalance)
  if (fullEmergencyRemaining > 0 && !timelineBlocked) {
    addSavingsPhase('emergency-fund', `Complete ${emergencyCoverageMonths} months of cover`, 'Use the released monthly amount to finish the selected emergency-fund target.', fullEmergencyRemaining)
    emergencyBalance += fullEmergencyRemaining
  }

  let goalProjectedCompletionMonth: number | null = goalRemaining <= 0 ? 0 : null
  if (goalRemaining > 0 && !timelineBlocked) {
    addSavingsPhase('short-term-goal', `Fund ${goalName.trim() || 'your short-term goal'}`, 'After safety and expensive debt, direct the monthly amount toward this goal.', goalRemaining)
    goalProjectedCompletionMonth = phases.at(-1)?.id === 'short-term-goal' ? phases.at(-1)?.endMonth ?? null : null
  }

  if (!timelineBlocked) {
    phases.push({
      id: 'investing',
      title: 'Grow long-term investments',
      description: 'Once the earlier priorities are complete, add the released amount to the investments already running.',
      monthlyAllocation: existingInvestments + monthlyPool,
      remainingTarget: 0,
      durationMonths: null,
      startMonth: monthCursor,
      endMonth: null,
      ongoing: true,
    })
  }

  const currentPhase = phases[0]
  const priorityId: MoneyFlowPriorityId = currentPhase?.id ?? 'investing'
  const priorityCopy: Record<MoneyFlowPriorityId, { title: string; description: string }> = {
    shortfall: { title: 'Fix the monthly shortfall first.', description: 'A positive monthly amount is required before creating an allocation plan.' },
    'create-room': { title: 'Create monthly room first.', description: 'No unallocated monthly amount is currently available.' },
    'starter-safety': { title: 'Build one month of essential cover first.', description: `${formatCompactCurrency(currentPhase?.monthlyAllocation ?? 0)} per month begins the safety buffer before debt acceleration.` },
    'high-interest-debt': { title: 'High-interest debt is the next priority.', description: `Use ${formatCompactCurrency(currentPhase?.monthlyAllocation ?? 0)} extra each month above the entered minimum payment.` },
    'emergency-fund': { title: 'Complete the emergency fund next.', description: `Build toward ${emergencyCoverageMonths} months of essential commitments before adding a new investment.` },
    'short-term-goal': { title: `${goalName.trim() || 'Your short-term goal'} is next.`, description: `Direct ${formatCompactCurrency(currentPhase?.monthlyAllocation ?? 0)} monthly toward the remaining target.` },
    investing: { title: 'Your foundation is ready for investing.', description: 'No unfinished emergency, expensive-debt or short-term target remains in this plan.' },
  }
  const futureMonthlyInvestment = phases.find((phase) => phase.id === 'investing')?.monthlyAllocation ?? existingInvestments
  const goalOnTime = goalMonths > 0 && goalRemaining > 0
    ? goalProjectedCompletionMonth !== null && goalProjectedCompletionMonth <= goalMonths
    : goalMonths > 0 ? true : null

  return {
    debtMinimumPayment, monthlyCashFlowBeforeInvesting, availableMoney, monthlyShortfall,
    emergencyTarget, currentEmergencySavings, emergencyRemaining,
    emergencyCoverageMonths, currentEmergencyCoverage, debtBalance,
    goalTarget, goalSaved, goalRemaining, goalMonths, goalProjectedCompletionMonth, goalOnTime,
    priorityId, priorityTitle: priorityCopy[priorityId].title, priorityDescription: priorityCopy[priorityId].description,
    currentMonthlyAllocation: currentPhase?.id === 'investing' ? availableMoney : currentPhase?.monthlyAllocation ?? 0,
    futureMonthlyInvestment, phases,
    recovery: { reduceExistingInvestmentsBy: 0, reduceFlexibleSpendingBy: 0, unresolvedShortfall: 0 }, rules,
  }
}
