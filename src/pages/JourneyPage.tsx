import type { ComponentType } from 'react'
import { useParams } from 'react-router-dom'
import { HomeAffordabilityRoute } from '../components/journey/routes/HomeAffordabilityRoute'
import { MoneyFlowRoute } from '../components/journey/routes/MoneyFlowRoute'
import { homeJourneyDefinition } from '../data/journeys/homeAffordability'
import { moneyFlowDefinition } from '../data/journeys/moneyFlow'
import { NotFoundPage } from './NotFoundPage'

const journeyRoutes: Record<string, ComponentType> = {
  [homeJourneyDefinition.slug]: HomeAffordabilityRoute,
  [moneyFlowDefinition.slug]: MoneyFlowRoute,
}

export function JourneyPage() {
  const { journeyName } = useParams()
  const JourneyRoute = journeyName ? journeyRoutes[journeyName] : undefined

  if (!JourneyRoute) return <NotFoundPage />

  return <JourneyRoute />
}
