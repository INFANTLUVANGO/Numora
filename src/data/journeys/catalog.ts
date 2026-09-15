import type { JourneyDefinition } from '../../types/journey'
import { homeJourneyDefinition } from './homeAffordability'
import { moneyFlowDefinition } from './moneyFlow'

export const journeyCatalog: JourneyDefinition[] = [homeJourneyDefinition, moneyFlowDefinition]
