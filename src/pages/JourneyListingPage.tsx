import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NumoraIcon } from '../components/common/NumoraIcon'
import { journeyCatalog } from '../data/journeys'

export function JourneyListingPage() {
  return (
    <div className="journey-listing-page">
      <section className="journey-mast section-shell">
        <div className="journey-mast__grid"><div><span className="page-index">NUMORA / DECISION JOURNEYS</span><h1>Make the next<br /><em>decision clearer.</em></h1><p>Choose a real-life goal and move through the connected numbers that shape it.</p></div><div className="journey-mast__aside"><span>JOURNEYS / {String(journeyCatalog.length).padStart(2, '0')}</span><strong>One goal. Connected steps.</strong><small>Choose an approach and begin directly.</small></div></div>
      </section>

      <section className="journey-listing section-shell">
        <div className="section-heading section-heading--split"><div><span className="eyebrow">Start with your goal</span><h2>What do you want to decide?</h2></div><p>Choose the calculation you need inside a journey. There is no extra selection screen.</p></div>
        <div className="journey-listing__grid">
          {journeyCatalog.map((journey) => (
            <article className="journey-listing__card" key={journey.slug}>
              <div className="journey-listing__card-top"><span>JOURNEY {journey.number} / {journey.category}</span><NumoraIcon name={journey.icon} size={26} /></div>
              <div><h3>{journey.title}</h3><p>{journey.description}</p></div>
              <div className="journey-listing__options">
                <span>CHOOSE HOW TO BEGIN</span>
                <div>{journey.options.map((option, index) => <Link to={`/journey/${journey.slug}`} state={{ intent: option.id }} key={option.id}><small>0{index + 1}</small><strong>{option.label}</strong><p>{option.description}</p><i><ArrowRight size={17} /></i></Link>)}</div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
