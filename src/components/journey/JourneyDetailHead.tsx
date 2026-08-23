import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { JourneyDefinition } from '../../types/journey'

export function JourneyDetailHead({ definition, mode }: { definition: JourneyDefinition; mode: string }) {
  return (
    <section className="journey-detail-head section-shell">
      <Link className="back-link" to="/journey"><ArrowLeft size={16} /> All journeys</Link>
      <div className="journey-detail-head__content">
        <div>
          <span className="page-index">JOURNEY {definition.number} / {definition.category}</span>
          <h1>{definition.title}</h1>
          <p>{definition.description}</p>
        </div>
        <span className="journey-detail-head__mode">{mode}</span>
      </div>
    </section>
  )
}
