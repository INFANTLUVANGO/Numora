import type { CalculatorResult } from '../types/calculator'
import { formatCompactCurrency, formatCurrencyByCode } from '../utils/formatters'

const monthlyRate = (annualRate: number) => annualRate / 1200

export function calculateSip(inputs: Record<string, number>, mode: 'calculate' | 'goal'): CalculatorResult {
  const rate = monthlyRate(inputs.annualRate)
  const months = Math.max(1, inputs.years * 12)
  const stepUpRate = Math.max(0, inputs.stepUpRate ?? 0) / 100
  const project = (startingMonthly: number) => {
    let balance = 0
    let invested = 0
    let monthly = startingMonthly
    for (let month = 1; month <= months; month += 1) {
      if (month > 1 && (month - 1) % 12 === 0) monthly *= 1 + stepUpRate
      invested += monthly
      balance = (balance + monthly) * (1 + rate)
    }
    return { balance, invested, finalMonthly: monthly }
  }
  const unitProjection = project(1)
  const monthly = mode === 'goal' ? inputs.targetAmount / Math.max(1, unitProjection.balance) : inputs.monthlyInvestment
  const projection = project(monthly)
  const corpus = projection.balance
  const invested = projection.invested
  const gain = corpus - invested
  const increaseText = stepUpRate > 0 ? `, increasing by ${inputs.stepUpRate}% each year,` : ''

  return {
    primary: { label: mode === 'goal' ? 'Monthly SIP required' : 'Estimated future value', value: mode === 'goal' ? monthly : corpus, kind: 'currency' },
    summary: mode === 'goal'
      ? `A starting monthly SIP of about ${formatCompactCurrency(monthly)}${increaseText} may build your target over ${inputs.years} years.`
      : `Your contributions may grow to ${formatCompactCurrency(corpus)} over ${inputs.years} years${stepUpRate > 0 ? ` with a ${inputs.stepUpRate}% annual increase` : ''}.`,
    breakdown: [
      { label: 'Total invested', value: invested, kind: 'currency' },
      { label: 'Estimated gains', value: gain, kind: 'currency', tone: 'positive' },
      { label: stepUpRate > 0 ? 'Final monthly SIP' : 'Monthly SIP', value: projection.finalMonthly, kind: 'currency' },
    ],
    insights: [
      `Estimated gains account for ${corpus ? Math.max(0, (gain / corpus) * 100).toFixed(0) : 0}% of the final value.`,
      stepUpRate > 0 ? `Your SIP rises by ${inputs.stepUpRate}% once every 12 months. Make sure each increase remains comfortable.` : 'A 0% annual SIP increase is a normal SIP with the same monthly contribution throughout.',
      'Longer horizons give compounding more time to work, but market returns are not guaranteed.',
    ],
    chart: [
      { label: 'Invested', value: invested, color: '#163f3a' },
      { label: 'Growth', value: Math.max(0, gain), color: '#ff5c35' },
    ],
  }
}

export function calculateLumpsum(inputs: Record<string, number>): CalculatorResult {
  const future = inputs.investment * (1 + inputs.annualRate / 100) ** inputs.years
  const gains = future - inputs.investment
  return {
    primary: { label: 'Estimated future value', value: future, kind: 'currency' },
    summary: `${formatCompactCurrency(inputs.investment)} may grow to ${formatCompactCurrency(future)} over ${inputs.years} years.`,
    breakdown: [
      { label: 'Initial investment', value: inputs.investment, kind: 'currency' },
      { label: 'Estimated gains', value: gains, kind: 'currency', tone: 'positive' },
      { label: 'Absolute return', value: inputs.investment ? (gains / inputs.investment) * 100 : 0, kind: 'percentage' },
    ],
    insights: ['This is a projection using a constant annual return.', 'Actual returns can vary significantly from year to year.'],
    chart: [
      { label: 'Principal', value: inputs.investment, color: '#254e78' },
      { label: 'Growth', value: Math.max(0, gains), color: '#ffb000' },
    ],
  }
}

export function calculateSwp(inputs: Record<string, number>): CalculatorResult {
  const initialCorpus = Math.max(0, inputs.initialCorpus)
  const monthlyWithdrawal = Math.max(0, inputs.monthlyWithdrawal)
  const monthlyRateValue = monthlyRate(inputs.annualRate)
  const totalMonths = Math.max(1, Math.round(inputs.years * 12))
  const annualIncrease = Math.max(0, inputs.withdrawalIncrease ?? 0) / 100
  let balance = initialCorpus
  let totalWithdrawn = 0
  let monthsCompleted = 0

  for (let month = 1; month <= totalMonths && balance > 0; month += 1) {
    balance *= 1 + monthlyRateValue
    const withdrawal = monthlyWithdrawal * (1 + annualIncrease) ** Math.floor((month - 1) / 12)
    const actualWithdrawal = Math.min(balance, withdrawal)
    balance -= actualWithdrawal
    totalWithdrawn += actualWithdrawal
    monthsCompleted = month
  }

  const investmentGrowth = balance + totalWithdrawn - initialCorpus
  const corpusDepleted = balance <= 0 && monthsCompleted < totalMonths
  const summary = corpusDepleted
    ? `Your corpus may be exhausted after approximately ${(monthsCompleted / 12).toFixed(1)} years of withdrawals.`
    : `You may withdraw ${formatCompactCurrency(totalWithdrawn)} over ${inputs.years} years and retain about ${formatCompactCurrency(balance)}.`

  return {
    primary: { label: 'Remaining corpus', value: Math.max(0, balance), kind: 'currency', tone: corpusDepleted ? 'warning' : 'positive' },
    summary,
    breakdown: [
      { label: 'Starting corpus', value: initialCorpus, kind: 'currency' },
      { label: 'Total withdrawn', value: totalWithdrawn, kind: 'currency' },
      { label: 'Estimated investment growth', value: investmentGrowth, kind: 'currency', tone: 'positive' },
      { label: 'Monthly withdrawal', value: monthlyWithdrawal, kind: 'currency' },
      { label: 'Withdrawal period', value: inputs.years, kind: 'years' },
      { label: 'Corpus lasts', value: corpusDepleted ? monthsCompleted / 12 : inputs.years, kind: 'years', displayValue: corpusDepleted ? `Depleted after ${(monthsCompleted / 12).toFixed(1)} years` : `Full ${inputs.years}-year period`, tone: corpusDepleted ? 'warning' : 'positive' },
    ],
    insights: [
      corpusDepleted ? 'At this withdrawal rate, the corpus may not last for the full selected period.' : `After the selected period, approximately ${formatCompactCurrency(balance)} may remain for future needs.`,
      `Estimated investment growth is calculated as the remaining corpus plus withdrawals, minus the starting corpus. It is a projection before taxes, fees and market volatility.`,
    ],
    chart: [
      { label: 'Withdrawn', value: Math.max(0, totalWithdrawn), color: '#ff5c35' },
      { label: 'Remaining', value: Math.max(0, balance), color: '#163f3a' },
    ],
  }
}

export function calculateEmi(inputs: Record<string, number>, mode: 'calculate' | 'goal'): CalculatorResult {
  const rate = monthlyRate(inputs.annualRate)
  const months = Math.max(1, inputs.years * 12)
  const multiplier = rate === 0 ? 1 / months : (rate * (1 + rate) ** months) / ((1 + rate) ** months - 1)
  const principal = mode === 'goal' ? inputs.affordableEmi / multiplier : inputs.loanAmount
  const emi = principal * multiplier
  const total = emi * months
  const interest = total - principal
  return {
    primary: { label: mode === 'goal' ? 'Estimated affordable loan' : 'Monthly EMI', value: mode === 'goal' ? principal : emi, kind: 'currency' },
    summary: mode === 'goal'
      ? `An EMI of ${formatCompactCurrency(inputs.affordableEmi)} may support a loan near ${formatCompactCurrency(principal)}.`
      : `Your estimated monthly repayment is ${formatCompactCurrency(emi)} for ${inputs.years} years.`,
    breakdown: [
      { label: 'Principal', value: principal, kind: 'currency' },
      { label: 'Total interest', value: interest, kind: 'currency', tone: 'warning' },
      { label: 'Total repayment', value: total, kind: 'currency' },
    ],
    insights: [
      `Interest forms ${total ? Math.max(0, (interest / total) * 100).toFixed(0) : 0}% of total repayment.`,
      'Processing fees, insurance, changing rates and prepayments are not included.',
    ],
    chart: [
      { label: 'Principal', value: principal, color: '#254e78' },
      { label: 'Interest', value: Math.max(0, interest), color: '#ff5c35' },
    ],
  }
}

export function calculateSalary(inputs: Record<string, number>): CalculatorResult {
  const bonusIncluded = inputs.bonusIncluded === 1
  const fixedCtc = Math.max(0, inputs.annualCtc - (bonusIncluded ? inputs.annualBonus : 0))
  const totalAnnualCompensation = inputs.annualCtc + (bonusIncluded ? 0 : inputs.annualBonus)
  const basic = fixedCtc * (inputs.basicPercent / 100)
  const employeeEpf = Math.min(basic, 180000) * (inputs.epfRate / 100)
  const employerEpf = employeeEpf
  const gratuity = basic * 0.0481
  const cashGross = Math.max(0, fixedCtc - employerEpf - gratuity)
  const monthlyPreTax = (cashGross - employeeEpf) / 12
  return {
    primary: { label: 'Monthly fixed pre-tax take-home', value: monthlyPreTax, kind: 'currency' },
    summary: bonusIncluded
      ? `The bonus is inside your CTC and paid separately, leaving an estimated fixed monthly take-home of ${formatCompactCurrency(monthlyPreTax)}.`
      : `The bonus is additional to your CTC and does not reduce the estimated fixed monthly take-home of ${formatCompactCurrency(monthlyPreTax)}.`,
    breakdown: [
      { label: 'Annual fixed cash salary', value: Math.max(0, cashGross - employeeEpf), kind: 'currency' },
      { label: 'Annual bonus paid separately', value: inputs.annualBonus, kind: 'currency' },
      { label: 'Total annual compensation', value: totalAnnualCompensation, kind: 'currency' },
    ],
    insights: [bonusIncluded ? 'The annual bonus has been separated from the fixed monthly salary because it is included in CTC.' : 'The annual bonus has been added above CTC and does not reduce fixed monthly salary.', 'Income tax, professional tax and company-specific deductions are not included here.'],
    chart: [
      { label: 'Cash component', value: cashGross, color: '#163f3a' },
      { label: 'Bonus', value: inputs.annualBonus, color: '#ffb000' },
      { label: 'Benefits', value: employerEpf + gratuity, color: '#7f6df2' },
    ],
  }
}

export function calculateBudget(inputs: Record<string, number>): CalculatorResult {
  const spending = inputs.essentials + inputs.lifestyle + inputs.emi
  const savings = inputs.monthlyIncome - spending
  const rate = inputs.monthlyIncome ? (savings / inputs.monthlyIncome) * 100 : 0
  return {
    primary: { label: savings >= 0 ? 'Monthly surplus' : 'Monthly shortfall', value: Math.abs(savings), kind: 'currency', tone: savings >= 0 ? 'positive' : 'warning' },
    summary: savings >= 0 ? `You retain ${formatCompactCurrency(savings)} after planned monthly spending.` : `Planned spending exceeds income by ${formatCompactCurrency(Math.abs(savings))}.`,
    breakdown: [
      { label: 'Total spending', value: spending, kind: 'currency' },
      { label: 'Savings rate', value: rate, kind: 'percentage', tone: rate >= 20 ? 'positive' : 'warning' },
      { label: 'EMI share of income', value: inputs.monthlyIncome ? (inputs.emi / inputs.monthlyIncome) * 100 : 0, kind: 'percentage' },
    ],
    insights: [rate >= 20 ? 'Your planned savings rate is at or above 20%.' : 'Consider reviewing flexible spending to create more monthly room.', 'A budget works best when it reflects irregular annual expenses too.'],
    chart: [
      { label: 'Essentials', value: inputs.essentials, color: '#254e78' },
      { label: 'Lifestyle', value: inputs.lifestyle, color: '#ffb000' },
      { label: 'EMIs', value: inputs.emi, color: '#ff5c35' },
      { label: 'Surplus', value: Math.max(0, savings), color: '#163f3a' },
    ],
  }
}

export function calculateEmergencyFund(inputs: Record<string, number>): CalculatorResult {
  const target = inputs.monthlyExpenses * inputs.coverageDuration
  const remaining = Math.max(0, target - inputs.currentSavings)
  const currentCoverage = inputs.monthlyExpenses > 0 ? inputs.currentSavings / inputs.monthlyExpenses : 0
  const progress = target > 0 ? Math.min(100, (inputs.currentSavings / target) * 100) : 0
  const goalReached = target > 0 && inputs.currentSavings >= target
  const monthsToGoal = !goalReached && inputs.monthlyContribution > 0 ? Math.ceil(remaining / inputs.monthlyContribution) : 0
  const timeline = goalReached ? 'Goal Reached' : inputs.monthlyContribution > 0 ? `${monthsToGoal} months` : 'Add monthly contribution'
  return {
    primary: { label: 'Emergency fund goal', value: target, kind: 'currency' },
    summary: goalReached
      ? `Your current emergency savings have reached the ${inputs.coverageDuration}-month target.`
      : inputs.monthlyContribution > 0
        ? `Contributing ${formatCompactCurrency(inputs.monthlyContribution)} monthly may close the remaining gap in about ${monthsToGoal} months.`
        : `You need ${formatCompactCurrency(remaining)} more to complete your ${inputs.coverageDuration}-month emergency fund.`,
    breakdown: [
      { label: 'Current emergency savings', value: inputs.currentSavings, kind: 'currency' },
      { label: 'Remaining amount', value: remaining, kind: 'currency', tone: goalReached ? 'positive' : 'warning' },
      { label: 'Current coverage', value: currentCoverage, kind: 'months' },
      { label: 'Target coverage', value: inputs.coverageDuration, kind: 'months' },
      { label: 'Funding progress', value: progress, kind: 'percentage', tone: goalReached ? 'positive' : 'default' },
      { label: 'Estimated time to goal', value: monthsToGoal, displayValue: timeline, kind: 'months', tone: goalReached ? 'positive' : 'default' },
    ],
    insights: [goalReached ? 'Your selected emergency-fund goal is fully funded.' : inputs.monthlyContribution > 0 ? `Continue the planned monthly contribution to reach the target in approximately ${monthsToGoal} months.` : 'Add an optional monthly contribution to estimate how long reaching the goal may take.', 'Keep emergency savings accessible and separate from long-term investments.'],
    chart: [
      { label: 'Current savings', value: Math.min(target, inputs.currentSavings), color: '#163f3a' },
      { label: 'Remaining', value: remaining, color: '#ff5c35' },
    ],
  }
}

export function calculateRetirement(inputs: Record<string, number>): CalculatorResult {
  const yearsToRetire = Math.max(0, inputs.retirementAge - inputs.currentAge)
  const annualRate = inputs.annualRate / 100
  const retirementCorpusNeeded = inputs.monthlyExpensesAfterRetirement * 12 * inputs.retirementDuration
  const projectedCurrentSavings = inputs.currentSavings * (1 + annualRate) ** yearsToRetire
  const annualContributionFactor = yearsToRetire === 0 ? 0 : annualRate === 0 ? yearsToRetire : ((1 + annualRate) ** yearsToRetire - 1) / annualRate
  const projectedMonthlyInvestments = inputs.monthlyInvestment * 12 * annualContributionFactor
  const projectedRetirementCorpus = projectedCurrentSavings + projectedMonthlyInvestments
  const additionalCorpusNeeded = Math.max(0, retirementCorpusNeeded - inputs.currentSavings)
  const amountNeededAfterSavingsGrowth = Math.max(0, retirementCorpusNeeded - projectedCurrentSavings)
  const monthlyInvestmentNeeded = annualContributionFactor > 0 ? amountNeededAfterSavingsGrowth / annualContributionFactor / 12 : amountNeededAfterSavingsGrowth
  const surplusOrShortfall = projectedRetirementCorpus - retirementCorpusNeeded
  const hasSurplus = surplusOrShortfall >= 0
  return {
    primary: { label: hasSurplus ? 'Projected retirement surplus' : 'Projected retirement shortfall', value: Math.abs(surplusOrShortfall), kind: 'currency', tone: hasSurplus ? 'positive' : 'warning' },
    summary: hasSurplus
      ? `Your projected corpus of ${formatCompactCurrency(projectedRetirementCorpus)} is about ${formatCompactCurrency(surplusOrShortfall)} above the estimated requirement.`
      : `You may need ${formatCompactCurrency(Math.abs(surplusOrShortfall))} more because the projected corpus is ${formatCompactCurrency(projectedRetirementCorpus)} against a target of ${formatCompactCurrency(retirementCorpusNeeded)}.`,
    breakdown: [
      { label: 'Retirement corpus needed', value: retirementCorpusNeeded, kind: 'currency' },
      { label: 'Projected retirement corpus', value: projectedRetirementCorpus, kind: 'currency', tone: hasSurplus ? 'positive' : 'warning' },
      { label: 'Current retirement savings', value: inputs.currentSavings, kind: 'currency' },
      { label: 'Additional corpus needed today', value: additionalCorpusNeeded, kind: 'currency' },
      { label: 'Years until retirement', value: yearsToRetire, kind: 'years' },
      { label: 'Monthly investment needed', value: monthlyInvestmentNeeded, kind: 'currency' },
    ],
    insights: [hasSurplus ? 'Your current plan is projected to meet the estimated retirement requirement.' : `Your current monthly investment is ${formatCompactCurrency(inputs.monthlyInvestment)}; reaching the target may require approximately ${formatCompactCurrency(monthlyInvestmentNeeded)} per month.`, 'The required corpus uses the monthly expense amount you expect after retirement, not today’s monthly expenses.'],
    chart: [
      { label: 'Savings value at retirement', value: projectedCurrentSavings, color: '#254e78' },
      { label: 'Value from monthly investing', value: projectedMonthlyInvestments, color: '#ff5c35' },
    ],
  }
}

export function calculateNetWorth(inputs: Record<string, number>): CalculatorResult {
  const assets = inputs.cash + inputs.investments + inputs.property + inputs.otherAssets
  const liabilities = inputs.homeLoan + inputs.otherLoans
  const netWorth = assets - liabilities
  return {
    primary: { label: 'Estimated net worth', value: netWorth, kind: 'currency', tone: netWorth >= 0 ? 'positive' : 'warning' },
    summary: `Your listed assets minus liabilities equal ${formatCompactCurrency(netWorth)}.`,
    breakdown: [
      { label: 'Total assets', value: assets, kind: 'currency' },
      { label: 'Total liabilities', value: liabilities, kind: 'currency' },
      { label: 'Debt-to-asset ratio', value: assets ? (liabilities / assets) * 100 : 0, kind: 'percentage' },
    ],
    insights: ['Track net worth periodically to see direction, not just today’s number.', 'Asset values and outstanding balances should be updated consistently.'],
    chart: [
      { label: 'Assets', value: assets, color: '#163f3a' },
      { label: 'Liabilities', value: liabilities, color: '#ff5c35' },
    ],
  }
}

export function calculateHomeAffordability(inputs: Record<string, number>): CalculatorResult {
  const availableEmi = Math.max(0, inputs.monthlyHomeLoanPayment)
  const salaryBalance = Math.max(0, inputs.monthlySalary - inputs.totalExpenses)
  const loan = calculateEmi({ affordableEmi: availableEmi, annualRate: inputs.annualRate, years: inputs.years }, 'goal').primary.value
  const homeValue = loan / Math.max(0.1, 1 - inputs.downPaymentPercent / 100)
  return {
    primary: { label: 'Indicative home budget', value: homeValue, kind: 'currency' },
    summary: `Your inputs suggest a home budget near ${formatCompactCurrency(homeValue)} with an EMI around ${formatCompactCurrency(availableEmi)}.`,
    breakdown: [
      { label: 'Indicative loan', value: loan, kind: 'currency' },
      { label: 'Down payment', value: homeValue - loan, kind: 'currency' },
      { label: 'Monthly home-loan payment', value: availableEmi, kind: 'currency' },
    ],
    insights: [availableEmi > salaryBalance ? 'Your chosen home-loan payment is higher than salary minus expenses. Review it before proceeding.' : `After expenses, you have ${formatCompactCurrency(salaryBalance)} available each month and selected ${formatCompactCurrency(availableEmi)} for the home loan.`, 'Stamp duty, registration, interiors and lender eligibility are not included.'],
    chart: [
      { label: 'Loan', value: loan, color: '#254e78' },
      { label: 'Down payment', value: homeValue - loan, color: '#ffb000' },
    ],
  }
}

export function calculateSplit(inputs: Record<string, number>): CalculatorResult {
  const total = inputs.rent + inputs.utilities + inputs.otherExpenses
  const perPerson = total / Math.max(1, inputs.people)
  return {
    primary: { label: 'Each person pays', value: perPerson, kind: 'currency' },
    summary: `${inputs.people} people can split ${formatCompactCurrency(total)} into ${formatCompactCurrency(perPerson)} each.`,
    breakdown: [
      { label: 'Total shared cost', value: total, kind: 'currency' },
      { label: 'Rent share each', value: inputs.rent / Math.max(1, inputs.people), kind: 'currency' },
      { label: 'Other share each', value: (inputs.utilities + inputs.otherExpenses) / Math.max(1, inputs.people), kind: 'currency' },
    ],
    insights: ['This uses an equal split between all people.', 'Individual usage or room-size adjustments are not included.'],
    chart: [
      { label: 'Rent', value: inputs.rent, color: '#254e78' },
      { label: 'Utilities', value: inputs.utilities, color: '#ffb000' },
      { label: 'Other', value: inputs.otherExpenses, color: '#7f6df2' },
    ],
  }
}

export function calculateFuel(inputs: Record<string, number>): CalculatorResult {
  const fuelUsed = inputs.distance / Math.max(1, inputs.mileage)
  const fuelCost = fuelUsed * inputs.fuelPrice
  const tollAndOther = inputs.tolls + inputs.otherCosts
  const total = fuelCost + tollAndOther
  return {
    primary: { label: 'Estimated trip cost', value: total, kind: 'currency' },
    summary: `A ${inputs.distance} km trip may cost about ${formatCompactCurrency(total)} in total.`,
    breakdown: [
      { label: 'Fuel required', value: fuelUsed, kind: 'number' },
      { label: 'Fuel cost', value: fuelCost, kind: 'currency' },
      { label: 'Cost per traveller', value: total / Math.max(1, inputs.travellers), kind: 'currency' },
    ],
    insights: ['Real mileage can change with traffic, load and driving conditions.', 'Parking and route-specific charges should be added under other costs.'],
    chart: [
      { label: 'Fuel', value: fuelCost, color: '#163f3a' },
      { label: 'Tolls & other', value: tollAndOther, color: '#ff5c35' },
    ],
  }
}

export function calculateTravelBudget(inputs: Record<string, number>): CalculatorResult {
  const travellers = Math.max(1, Math.floor(inputs.travellers))
  const tripDays = Math.max(1, Math.floor(inputs.tripDays))
  const accommodationNights = Math.max(0, Math.floor(inputs.accommodationNights))
  const rooms = inputs.accommodationPerNight > 0 ? Math.max(1, Math.floor(inputs.rooms)) : 0
  const accommodation = inputs.accommodationPerNight * rooms * accommodationNights
  const food = inputs.foodPerPersonPerDay * travellers * tripDays
  const plannedSubtotal = inputs.roundTripTransport
    + inputs.localTransport
    + accommodation
    + food
    + inputs.activities
    + inputs.shopping
    + inputs.insurance
    + inputs.otherExpenses
  const contingency = plannedSubtotal * (inputs.contingencyPercent / 100)
  const total = plannedSubtotal + contingency
  const costPerPerson = total / travellers
  const dailyCostPerPerson = total / travellers / tripDays
  const monthlySaving = inputs.monthsUntilTrip > 0 ? total / inputs.monthsUntilTrip : 0
  const currency = (value: number) => formatCurrencyByCode(value, inputs.currency)

  return {
    primary: { label: 'Total trip cost', value: total, kind: 'currency', displayValue: currency(total) },
    summary: `This ${tripDays}-day plan for ${travellers} ${travellers === 1 ? 'traveller' : 'travellers'} may cost approximately ${currency(total)}.` ,
    breakdown: [
      { label: 'Cost per person', value: costPerPerson, kind: 'currency', displayValue: currency(costPerPerson) },
      { label: 'Daily cost per person', value: dailyCostPerPerson, kind: 'currency', displayValue: currency(dailyCostPerPerson) },
      { label: 'Recommended monthly saving', value: monthlySaving, kind: 'currency', displayValue: inputs.monthsUntilTrip > 0 ? currency(monthlySaving) : 'Add months until trip', tone: inputs.monthsUntilTrip > 0 ? 'positive' : 'default' },
    ],
    insights: [
      `The ${inputs.contingencyPercent}% safety buffer adds ${currency(contingency)} for unexpected costs.`,
      inputs.monthsUntilTrip > 0 ? `Saving about ${currency(monthlySaving)} each month may fund this plan in ${inputs.monthsUntilTrip} months.` : 'Add the months remaining until the trip to turn this budget into a monthly savings target.',
      'The destination and selected currency provide planning context only; NUMORA does not fetch prices or convert exchange rates in V1.',
    ],
    chartTitle: 'Cost breakdown',
    chart: [
      { label: 'Round-trip transportation', value: inputs.roundTripTransport, displayValue: currency(inputs.roundTripTransport), color: '#254e78' },
      { label: 'Local transportation', value: inputs.localTransport, displayValue: currency(inputs.localTransport), color: '#4f7cac' },
      { label: 'Accommodation', value: accommodation, displayValue: currency(accommodation), color: '#7f6df2' },
      { label: 'Food', value: food, displayValue: currency(food), color: '#ffb000' },
      { label: 'Activities', value: inputs.activities, displayValue: currency(inputs.activities), color: '#ff5c35' },
      { label: 'Shopping', value: inputs.shopping, displayValue: currency(inputs.shopping), color: '#d96c9d' },
      { label: 'Travel insurance', value: inputs.insurance, displayValue: currency(inputs.insurance), color: '#2f7d6d' },
      { label: 'Other expenses', value: inputs.otherExpenses, displayValue: currency(inputs.otherExpenses), color: '#8b7355' },
      { label: 'Contingency', value: contingency, displayValue: currency(contingency), color: '#163f3a' },
    ],
  }
}
