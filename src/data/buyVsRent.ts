import type { BuyVsRentInputs } from '../types/buyVsRent'
import type { JourneyInputSpec, JourneyStepSpec } from '../types/journey'

export const fixedRentalOptions = [10000, 15000, 20000, 25000] as const

export const buyVsRentInputs: JourneyInputSpec[] = [
  { key: 'homePrice', label: 'Desired home amount', hint: 'Current purchase price of the home.', prefix: '₹', min: 0 },
  { key: 'downPaymentAmount', label: 'Down payment', hint: 'Amount you would pay upfront when buying.', prefix: '₹', min: 0 },
  { key: 'annualRate', label: 'Home-loan interest rate', hint: 'Annual rate used to calculate the EMI.', suffix: '% / yr', min: 0, max: 30, decimal: true },
  { key: 'years', label: 'Loan tenure', hint: 'Used for the EMI, SIP, lump sum and SWP periods.', suffix: 'years', min: 1, max: 35 },
  { key: 'propertyAppreciation', label: 'Property appreciation', hint: 'Assumed annual growth in the home value.', suffix: '% / yr', min: 0, max: 20, decimal: true },
  { key: 'sipReturn', label: 'SIP and lump-sum return', hint: 'Expected annual investment return.', suffix: '% / yr', min: 0, max: 30, decimal: true },
  { key: 'rentIncrease', label: 'Annual rent increase', hint: 'Each fixed option is treated as the first-year rent.', suffix: '% / yr', min: 0, max: 20, decimal: true },
  { key: 'swpReturn', label: 'SWP return', hint: 'Expected annual return while withdrawing the surplus.', suffix: '% / yr', min: 0, max: 20, decimal: true },
]

export const buyVsRentSteps: JourneyStepSpec[] = [
  { number: '01', eyebrow: 'HOME PLAN', title: 'Set the home you may buy.', description: 'Enter the purchase amount and the upfront amount available.', inputKeys: ['homePrice', 'downPaymentAmount'] },
  { number: '02', eyebrow: 'LOAN TERMS', title: 'Build the EMI side.', description: 'The interest rate and tenure determine the monthly loan commitment.', inputKeys: ['annualRate', 'years'] },
  { number: '03', eyebrow: 'FUTURE ASSUMPTIONS', title: 'Set one clear comparison horizon.', description: 'These assumptions power the home value, investments, changing rent and SWP.', inputKeys: ['propertyAppreciation', 'sipReturn', 'rentIncrease', 'swpReturn'] },
]

export const buyVsRentDefaults: BuyVsRentInputs = {
  homePrice: 10000000,
  downPaymentAmount: 2000000,
  annualRate: 12,
  years: 20,
  propertyAppreciation: 6,
  sipReturn: 12,
  rentIncrease: 5,
  swpReturn: 8,
}
