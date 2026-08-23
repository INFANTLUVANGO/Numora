export interface BuyVsRentInputs {
  homePrice: number
  downPaymentAmount: number
  annualRate: number
  years: number
  propertyAppreciation: number
  sipReturn: number
  rentIncrease: number
  swpReturn: number
}

export interface SwpOutcome {
  startingCorpus: number
  monthlyWithdrawal: number
  totalWithdrawn: number
  remainingCorpus: number
  durationMonths: number
}

export interface RentalComparison {
  startingRent: number
  startingMonthlySip: number
  sipCorpus: number
  sipSurplus: number
  sipOnlySwp: SwpOutcome
  combinedSwp: SwpOutcome
}

export interface BuyVsRentResult {
  homePrice: number
  downPayment: number
  loanAmount: number
  annualRate: number
  years: number
  monthlyEmi: number
  totalInterest: number
  propertyAppreciation: number
  futureHomeValue: number
  sipReturn: number
  requiredMonthlySip: number
  lumpsumFutureValue: number
  lumpsumGain: number
  rentIncrease: number
  swpReturn: number
  validRentals: RentalComparison[]
}
