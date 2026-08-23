import { useLocation, useParams } from 'react-router-dom'
import { BuyVsRentJourney } from '../components/journey/buy-vs-rent/BuyVsRentJourney'
import { HomeAffordabilityJourney } from '../components/journey/home/HomeAffordabilityJourney'
import { JourneyDetailHead } from '../components/journey/JourneyDetailHead'
import { MoneyFlowJourney } from '../components/journey/money-flow/MoneyFlowJourney'
import { buyVsRentDefaults } from '../data/buyVsRent'
import { homeJourneyDefinition } from '../data/journeys'
import { moneyFlowDefinition } from '../data/moneyFlow'
import type { BuyVsRentInputs } from '../types/buyVsRent'
import type { JourneyIntent } from '../types/journey'
import { NotFoundPage } from './NotFoundPage'

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

export function JourneyPage() {
  const { journeyName } = useParams()
  const location = useLocation()

  if (journeyName === moneyFlowDefinition.slug) {
    return (
      <div className="journey-page">
        <JourneyDetailHead definition={moneyFlowDefinition} mode={moneyFlowDefinition.options[0].label} />
        <MoneyFlowJourney />
      </div>
    )
  }

  if (journeyName !== homeJourneyDefinition.slug) return <NotFoundPage />

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
