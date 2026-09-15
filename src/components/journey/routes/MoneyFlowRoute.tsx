import { MoneyFlowJourney } from '../money-flow/MoneyFlowJourney'
import { JourneyDetailHead } from '../shared/JourneyDetailHead'
import { moneyFlowDefinition } from '../../../data/journeys/moneyFlow'

export function MoneyFlowRoute() {
  return (
    <div className="journey-page">
      <JourneyDetailHead definition={moneyFlowDefinition} mode={moneyFlowDefinition.options[0].label} />
      <MoneyFlowJourney />
    </div>
  )
}
