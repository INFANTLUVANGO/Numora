import type { CalculatorResult } from '../types/calculator'
import { formatCompactCurrency, formatCurrencyByCode } from '../utils/formatters'

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
    summary: `This ${tripDays}-day plan for ${travellers} ${travellers === 1 ? 'traveller' : 'travellers'} may cost approximately ${currency(total)}.`,
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
