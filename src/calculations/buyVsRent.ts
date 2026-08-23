import type { BuyVsRentInputs, BuyVsRentResult, RentalComparison, SwpOutcome } from '../types/buyVsRent'
import { annualPercentageToMonthlyRate, toNonNegativeNumber } from './helpers'
import { calculateEmi } from './index'

function projectMonthlyInvestment(monthlyInvestment: number, annualRate: number, months: number) {
  const monthlyRate = annualPercentageToMonthlyRate(annualRate)
  let balance = 0
  let invested = 0

  for (let month = 0; month < months; month += 1) {
    invested += monthlyInvestment
    balance = (balance + monthlyInvestment) * (1 + monthlyRate)
  }

  return { balance, invested }
}

function calculateSustainableSwp(corpus: number, annualRate: number, months: number): SwpOutcome {
  if (corpus <= 0 || months <= 0) {
    return { startingCorpus: 0, monthlyWithdrawal: 0, totalWithdrawn: 0, remainingCorpus: 0, durationMonths: 0 }
  }

  const monthlyRate = annualPercentageToMonthlyRate(annualRate)
  const monthlyWithdrawal = monthlyRate === 0
    ? corpus / months
    : corpus * monthlyRate / (1 - (1 + monthlyRate) ** -months)
  let balance = corpus
  let totalWithdrawn = 0

  for (let month = 0; month < months; month += 1) {
    balance *= 1 + monthlyRate
    const withdrawal = Math.min(balance, monthlyWithdrawal)
    balance -= withdrawal
    totalWithdrawn += withdrawal
  }

  return {
    startingCorpus: corpus,
    monthlyWithdrawal,
    totalWithdrawn,
    remainingCorpus: Math.max(0, balance),
    durationMonths: months,
  }
}

function projectRental(
  startingRent: number,
  monthlyEmi: number,
  years: number,
  rentIncrease: number,
  sipReturn: number,
  futureHomeValue: number,
  lumpsumFutureValue: number,
  swpReturn: number,
): RentalComparison {
  const months = years * 12
  const monthlySipRate = sipReturn / 1200
  let sipCorpus = 0

  for (let month = 0; month < months; month += 1) {
    const monthlyRent = startingRent * (1 + rentIncrease / 100) ** Math.floor(month / 12)
    const monthlySip = Math.max(0, monthlyEmi - monthlyRent)
    sipCorpus = (sipCorpus + monthlySip) * (1 + monthlySipRate)
  }

  const sipSurplus = sipCorpus - futureHomeValue
  const combinedSurplus = sipCorpus + lumpsumFutureValue - futureHomeValue

  return {
    startingRent,
    startingMonthlySip: Math.max(0, monthlyEmi - startingRent),
    sipCorpus,
    sipSurplus,
    sipOnlySwp: calculateSustainableSwp(Math.max(0, sipSurplus), swpReturn, months),
    combinedSwp: calculateSustainableSwp(Math.max(0, combinedSurplus), swpReturn, months),
  }
}

export function calculateBuyVsRent(
  rawInputs: BuyVsRentInputs,
  rentalOptions: readonly number[],
): BuyVsRentResult {
  const homePrice = toNonNegativeNumber(rawInputs.homePrice)
  const downPayment = Math.min(homePrice, toNonNegativeNumber(rawInputs.downPaymentAmount))
  const loanAmount = Math.max(0, homePrice - downPayment)
  const annualRate = toNonNegativeNumber(rawInputs.annualRate)
  const years = Math.max(1, Math.round(toNonNegativeNumber(rawInputs.years)))
  const propertyAppreciation = toNonNegativeNumber(rawInputs.propertyAppreciation)
  const sipReturn = toNonNegativeNumber(rawInputs.sipReturn)
  const rentIncrease = toNonNegativeNumber(rawInputs.rentIncrease)
  const swpReturn = toNonNegativeNumber(rawInputs.swpReturn)
  const months = years * 12

  const emiResult = calculateEmi({ loanAmount, annualRate, years }, 'calculate')
  const monthlyEmi = emiResult.primary.value
  const totalRepayment = monthlyEmi * months
  const totalInterest = Math.max(0, totalRepayment - loanAmount)
  const futureHomeValue = homePrice * (1 + propertyAppreciation / 100) ** years
  const lumpsumFutureValue = downPayment * (1 + sipReturn / 100) ** years
  const lumpsumGain = Math.max(0, lumpsumFutureValue - downPayment)
  const unitSip = projectMonthlyInvestment(1, sipReturn, months).balance
  const requiredMonthlySip = futureHomeValue / Math.max(1, unitSip)

  const rentals = rentalOptions.map((rent) => projectRental(
    rent,
    monthlyEmi,
    years,
    rentIncrease,
    sipReturn,
    futureHomeValue,
    lumpsumFutureValue,
    swpReturn,
  ))
  const validRentals = rentals.filter((rental) => rental.sipCorpus >= futureHomeValue)

  return {
    homePrice,
    downPayment,
    loanAmount,
    annualRate,
    years,
    monthlyEmi,
    totalInterest,
    propertyAppreciation,
    futureHomeValue,
    sipReturn,
    requiredMonthlySip,
    lumpsumFutureValue,
    lumpsumGain,
    rentIncrease,
    swpReturn,
    validRentals,
  }
}
