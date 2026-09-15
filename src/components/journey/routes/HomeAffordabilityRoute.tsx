import { useLocation } from 'react-router-dom'
import { BuyVsRentJourney } from '../buy-vs-rent/BuyVsRentJourney'
import { HomeAffordabilityJourney } from '../home-affordability/HomeAffordabilityJourney'
import { JourneyDetailHead } from '../shared/JourneyDetailHead'
import { buyVsRentDefaults } from '../../../data/journeys/buyVsRent'
import { homeJourneyDefinition } from '../../../data/journeys/homeAffordability'
import type { BuyVsRentInputs } from '../../../types/buyVsRent'
import type { JourneyIntent } from '../../../types/homeAffordability'

function getSelectedIntent(state: unknown): JourneyIntent {
  const intent = (state as { intent?: unknown } | null)?.intent
  if (intent === 'find-budget' || intent === 'buy-vs-rent') return intent
  return 'check-home'
}

function getComparisonValues(state: unknown): { values: BuyVsRentInputs; carried: boolean } {
  const routeState = state as { carriedValues?: Partial<BuyVsRentInputs>; source?: unknown } | null

  return {
    values: { ...buyVsRentDefaults, ...(routeState?.carriedValues ?? {}) },
    carried: routeState?.source === 'affordability',
  }
}

export function HomeAffordabilityRoute() {
  const location = useLocation()
  const intent = getSelectedIntent(location.state)
  const selectedOption = homeJourneyDefinition.options.find((option) => option.id === intent) ?? homeJourneyDefinition.options[0]
  const comparison = getComparisonValues(location.state)

  return (
    <div className="journey-page">
      <JourneyDetailHead definition={homeJourneyDefinition} mode={selectedOption.label} />
      {intent === 'buy-vs-rent'
        ? <BuyVsRentJourney initialValues={comparison.values} carried={comparison.carried} />
        : <HomeAffordabilityJourney intent={intent} />}
    </div>
  )
}
