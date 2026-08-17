import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const stops = [
  { number: '01', label: 'Know your take-home', slug: 'salary-calculator' },
  { number: '02', label: 'Shape your month', slug: 'monthly-budget-planner' },
  { number: '03', label: 'Build your buffer', slug: 'emergency-fund-calculator' },
  { number: '04', label: 'Fund the future', slug: 'sip-calculator' },
]

export function MoneyJourney() {
  return (
    <section className="money-journey">
      <div className="section-shell">
        <div className="journey-title"><span className="eyebrow">A connected money journey</span><h2>One answer should<br />lead somewhere useful.</h2></div>
        <div className="journey-track">
          {stops.map((stop, index) => (
            <Link to={`/calculators/${stop.slug}`} key={stop.number}>
              <span>{stop.number}</span><strong>{stop.label}</strong>{index < stops.length - 1 && <ArrowRight size={18} />}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
