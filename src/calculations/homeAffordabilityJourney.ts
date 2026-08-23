import { calculateEmergencyFund, calculateEmi, calculateSip } from './index'
import type { HomeJourneyResult, JourneyAlternative, JourneyIntent, JourneyStatus } from '../types/journey'
import { formatCompactCurrency } from '../utils/formatters'
import { annualPercentageToMonthlyRate, toNonNegativeNumber } from './helpers'

type CoreResult = Omit<HomeJourneyResult, 'alternatives'>

function calculateLoanWithExtraPayment(principal: number, annualRate: number, monthlyPayment: number, fallbackMonths: number) {
  if (principal <= 0 || monthlyPayment <= 0) return { interest: 0, months: 0 }

  const rate = annualPercentageToMonthlyRate(annualRate)
  let balance = principal
  let interest = 0
  let months = 0
  const maximumMonths = Math.max(600, fallbackMonths * 2)

  while (balance > 0.01 && months < maximumMonths) {
    const monthlyInterest = balance * rate
    if (monthlyPayment <= monthlyInterest) {
      return { interest: Math.max(0, monthlyPayment * fallbackMonths - principal), months: fallbackMonths }
    }

    const payment = Math.min(monthlyPayment, balance + monthlyInterest)
    interest += monthlyInterest
    balance -= payment - monthlyInterest
    months += 1
  }

  return { interest: Math.max(0, interest), months }
}

function calculateCore(inputs: Record<string, number>, intent: JourneyIntent): CoreResult {
  const monthlyIncome = toNonNegativeNumber(inputs.monthlyIncome)
  const livingExpenses = toNonNegativeNumber(inputs.monthlyLivingExpenses)
  const existingEmis = toNonNegativeNumber(inputs.existingEmis)
  const downPayment = toNonNegativeNumber(inputs.downPaymentAmount)
  const annualRate = toNonNegativeNumber(inputs.annualRate)
  const years = Math.max(1, Math.round(toNonNegativeNumber(inputs.years)))
  const availableForHomeEmi = Math.max(0, monthlyIncome - livingExpenses - existingEmis)

  const cushionEnabled = intent === 'find-budget' && inputs.monthlyCushionEnabled !== 0
  const cushionPercent = Math.min(25, Math.max(10, Math.round(toNonNegativeNumber(inputs.monthlyCushionPercent) || 25)))
  const comfortableEmi = cushionEnabled ? availableForHomeEmi * (1 - cushionPercent / 100) : availableForHomeEmi
  const comfortableLoan = calculateEmi({ affordableEmi: comfortableEmi, annualRate, years }, 'goal').primary.value
  const cashflowLoan = calculateEmi({ affordableEmi: availableForHomeEmi, annualRate, years }, 'goal').primary.value
  const maxComfortableHome = comfortableLoan + downPayment
  const maxCashflowHome = cashflowLoan + downPayment
  const homePrice = intent === 'find-budget' ? maxComfortableHome : toNonNegativeNumber(inputs.homePrice)
  const loanAmount = Math.max(0, homePrice - downPayment)
  const scheduledEmi = calculateEmi({ loanAmount, annualRate, years }, 'calculate').primary.value
  const requestedExtraPayment = toNonNegativeNumber(inputs.monthlyExtraPayment)
  const extraMonthlyPayment = Math.min(requestedExtraPayment, Math.max(0, availableForHomeEmi - scheduledEmi))
  const monthlyEmi = scheduledEmi + extraMonthlyPayment
  const totalMonthlyCommitments = existingEmis + monthlyEmi
  const projectedMonthlyCommitments = livingExpenses + totalMonthlyCommitments
  const rawMonthlyRoom = monthlyIncome - projectedMonthlyCommitments
  const monthlyRoom = Math.abs(rawMonthlyRoom) < 1 ? 0 : rawMonthlyRoom
  const acceleratedLoan = calculateLoanWithExtraPayment(loanAmount, annualRate, monthlyEmi, years * 12)
  const totalInterest = extraMonthlyPayment > 0 ? acceleratedLoan.interest : Math.max(0, scheduledEmi * years * 12 - loanAmount)
  const tenureMonths = extraMonthlyPayment > 0 ? acceleratedLoan.months : years * 12
  const status: JourneyStatus = monthlyRoom > 0 ? 'comfortable' : monthlyRoom === 0 ? 'manageable' : 'tight'

  const monthlySurplus = Math.max(0, monthlyRoom)
  const sip = calculateSip({ monthlyInvestment: monthlySurplus, stepUpRate: 0, annualRate: 12, years: 15 }, 'calculate')
  const sipTotalInvested = sip.breakdown.find((item) => item.label === 'Total invested')?.value ?? 0
  const sipEstimatedGains = sip.breakdown.find((item) => item.label === 'Estimated gains')?.value ?? 0
  const emergency = calculateEmergencyFund({ monthlyExpenses: projectedMonthlyCommitments, currentSavings: 0, coverageDuration: 6, monthlyContribution: monthlySurplus })
  const emergencyMonths = emergency.breakdown.find((item) => item.label === 'Estimated time to goal')?.value ?? 0

  const statusCopy = status === 'comfortable'
    ? { title: 'Comfortable monthly cash flow.', description: `After expenses and the ${extraMonthlyPayment > 0 ? 'monthly loan payment' : 'home EMI'}, approximately ${formatCompactCurrency(monthlyRoom)} remains each month.` }
    : status === 'manageable'
      ? { title: 'Uses your full monthly capacity.', description: 'The plan leaves no monthly amount unallocated after projected commitments.' }
      : { title: 'This home leaves no monthly surplus.', description: `The home EMI is about ${formatCompactCurrency(Math.abs(monthlyRoom))} higher than the amount left after your current monthly commitments.` }

  const reasons = [
    monthlyRoom > 0 ? `${formatCompactCurrency(monthlyRoom)} remains after expenses, existing EMIs and the new home-loan payment.` : monthlyRoom === 0 ? 'The full available monthly cash flow is allocated to the projected commitments.' : `Monthly commitments exceed income by ${formatCompactCurrency(Math.abs(monthlyRoom))}.`,
    intent === 'find-budget'
      ? cushionEnabled ? `${cushionPercent}% of available cash flow is kept as a monthly cushion.` : 'The full available cash flow is used as the home-EMI capacity.'
      : extraMonthlyPayment > 0 ? `${formatCompactCurrency(extraMonthlyPayment)} from the monthly surplus is added above the scheduled EMI of ${formatCompactCurrency(scheduledEmi)}.` : 'The specific home is tested against the monthly cash flow available for its EMI.',
    'The down payment is treated as available because you entered it as your planned upfront amount.',
    `${extraMonthlyPayment > 0 ? 'The monthly loan payment' : 'The new home EMI'} is ${formatCompactCurrency(monthlyEmi)} and total interest is estimated at ${formatCompactCurrency(totalInterest)}.`,
  ]

  const nextSteps = status === 'comfortable'
    ? ['Review the improved scenarios below before committing.', 'Use the same monthly surplus for one priority: SIP growth or emergency-fund cover.']
    : status === 'manageable'
      ? ['This is your maximum cash-flow budget with no monthly cushion.', `Keep the ${cushionPercent}% cushion if you want room for unexpected monthly costs.`]
      : [`A home near ${formatCompactCurrency(maxComfortableHome)} better matches this monthly plan.`, 'Use the feasible scenarios below to reduce the price, raise the upfront amount, or close the monthly gap.']

  return {
    intent, homePrice, downPayment, loanAmount, scheduledEmi, extraMonthlyPayment, monthlyEmi, comfortableEmi,
    availableForHomeEmi, monthlyRoom, projectedMonthlyCommitments,
    maxComfortableHome, maxCashflowHome, cushionEnabled, cushionPercent, totalInterest, tenureMonths,
    sipProjection: { monthlyInvestment: monthlySurplus, projectedCorpus: sip.primary.value, totalInvested: sipTotalInvested, estimatedGains: sipEstimatedGains, annualRate: 12, years: 15 },
    emergencyProjection: { goal: emergency.primary.value, monthlyContribution: monthlySurplus, monthsToGoal: emergencyMonths, coverageDuration: 6 },
    status, statusTitle: statusCopy.title, statusDescription: statusCopy.description, reasons, nextSteps,
  }
}

function buildAlternative(id: string, title: string, description: string, changes: Record<string, number>, inputs: Record<string, number>, intent: JourneyIntent): JourneyAlternative {
  const projection = calculateCore({ ...inputs, ...changes }, intent)
  return {
    id,
    title,
    description,
    changes,
    homePrice: projection.homePrice,
    monthlyEmi: projection.monthlyEmi,
    monthlyRoom: projection.monthlyRoom,
    totalInterest: projection.totalInterest,
    tenureMonths: projection.tenureMonths,
  }
}

function findFeasibleTenureAlternative(inputs: Record<string, number>, intent: JourneyIntent, startingYears: number) {
  for (let years = startingYears + 1; years <= 35; years += 1) {
    const alternative = buildAlternative(
      'feasible-tenure',
      `Extend to ${years} years`,
      'Use the shortest longer tenure that brings this home within the available monthly cash flow.',
      { years },
      inputs,
      intent,
    )

    if (alternative.monthlyRoom >= 0) return alternative
  }

  return null
}

function isFeasibleAlternative(alternative: JourneyAlternative | null): alternative is JourneyAlternative {
  return alternative !== null && alternative.monthlyRoom >= 0
}

export function calculateHomeJourney(inputs: Record<string, number>, intent: JourneyIntent): HomeJourneyResult {
  const result = calculateCore(inputs, intent)
  const extraDownPayment = Math.min(result.homePrice, Math.round(result.downPayment + result.homePrice * 0.05))
  const longerTenure = Math.min(35, Math.round(toNonNegativeNumber(inputs.years)) + 5)
  const hasRemainingCapacity = result.monthlyRoom > 1
  const hasMonthlyShortfall = result.monthlyRoom < 0
  const availableSurplus = Math.max(0, Math.floor(result.monthlyRoom))
  const partialSurplusPayment = Math.min(10000, availableSurplus)
  const partialRepayment = partialSurplusPayment > 0
    ? buildAlternative(
        'extra-repayment',
        `Add ${formatCompactCurrency(partialSurplusPayment)} surplus to EMI`,
        'Move this amount from surplus to EMI for the same home.',
        { monthlyExtraPayment: partialSurplusPayment },
        inputs,
        intent,
      )
    : null
  const fullSurplusRepayment = availableSurplus > partialSurplusPayment
    ? buildAlternative(
        'full-surplus-repayment',
        `Add full ${formatCompactCurrency(availableSurplus)} surplus to EMI`,
        'Use the complete surplus for EMI on the same home.',
        { monthlyExtraPayment: availableSurplus },
        inputs,
        intent,
      )
    : null
  const affordableHome = buildAlternative(
    'affordable-home',
    hasRemainingCapacity ? 'See your higher home budget' : 'Try the affordable home budget',
    hasRemainingCapacity ? 'Use the remaining monthly capacity to test a higher home price.' : 'See the home price that fits the available monthly cash flow.',
    { homePrice: Math.round(result.maxCashflowHome) },
    inputs,
    intent,
  )
  const requiredDownPayment = Math.min(
    result.homePrice,
    Math.ceil(result.downPayment + Math.max(0, result.homePrice - result.maxCashflowHome)),
  )
  const additionalDownPayment = Math.max(0, requiredDownPayment - result.downPayment)
  const breakEvenUpfront = additionalDownPayment > 0
    ? buildAlternative(
        'required-upfront',
        `Raise down payment to ${formatCompactCurrency(requiredDownPayment)}`,
        `Add ${formatCompactCurrency(additionalDownPayment)} upfront so the same home fits the available EMI amount.`,
        { downPaymentAmount: requiredDownPayment },
        inputs,
        intent,
      )
    : null
  const monthlyGap = Math.ceil(Math.abs(Math.min(0, result.monthlyRoom)))
  const closeMonthlyGap = monthlyGap > 0
    ? buildAlternative(
        'close-monthly-gap',
        `Free up ${formatCompactCurrency(monthlyGap)} monthly`,
        'An equivalent income increase or expense reduction makes the current home plan fit.',
        { monthlyIncome: toNonNegativeNumber(inputs.monthlyIncome) + monthlyGap },
        inputs,
        intent,
      )
    : null
  const feasibleTenure = hasMonthlyShortfall
    ? findFeasibleTenureAlternative(inputs, intent, Math.round(toNonNegativeNumber(inputs.years)))
    : null

  const alternatives = intent === 'check-home'
    ? (hasMonthlyShortfall
        ? [affordableHome, breakEvenUpfront, feasibleTenure, closeMonthlyGap]
        : [
            hasRemainingCapacity ? affordableHome : null,
            extraDownPayment > result.downPayment
              ? buildAlternative('more-upfront', 'Increase the down payment by 5%', 'Reduce the EMI and total interest for the same home.', { downPaymentAmount: extraDownPayment }, inputs, intent)
              : null,
            partialRepayment,
            fullSurplusRepayment,
          ]
      ).filter(isFeasibleAlternative)
    : [
        buildAlternative(
          'use-cushion',
          `Use the ${result.cushionPercent}% cushion for EMI`,
          `Adds ${formatCompactCurrency(result.monthlyRoom)} to your monthly EMI capacity.`,
          { monthlyCushionEnabled: 0 },
          inputs,
          intent,
        ),
        buildAlternative('extra-capacity', 'Add ₹5,000 monthly capacity', 'See the budget unlocked by ₹5,000 more each month.', { monthlyIncome: toNonNegativeNumber(inputs.monthlyIncome) + 5000 }, inputs, intent),
        buildAlternative('more-upfront', 'Pay 5% more upfront', 'Use a larger down payment to increase the budget.', { downPaymentAmount: extraDownPayment }, inputs, intent),
        buildAlternative('longer-tenure', `Extend to ${longerTenure} years`, 'Raise the budget and compare the extra interest.', { years: longerTenure }, inputs, intent),
      ].filter(isFeasibleAlternative)

  return { ...result, alternatives }
}
