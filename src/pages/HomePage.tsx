import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CalculatorCard } from '../components/common/CalculatorCard'
import { DecisionPaths } from '../components/home/DecisionPaths'
import { Hero } from '../components/home/Hero'
import { MoneyJourney } from '../components/home/MoneyJourney'
import { TrustPanel } from '../components/home/TrustPanel'
import { calculators } from '../data/calculators'

export function HomePage() {
  const featured = ['sip-calculator', 'emi-calculator', 'travel-budget-planner', 'monthly-budget-planner', 'retirement-calculator', 'fuel-trip-calculator']
    .map((slug) => calculators.find((item) => item.slug === slug)!)

  return (
    <>
      <Hero />
      <DecisionPaths />
      <section className="featured-tools section-shell">
        <div className="section-heading section-heading--split">
          <div><span className="eyebrow">The decision desk</span><h2>Useful tools,<br />built to talk to each other.</h2></div>
          <Link className="text-link" to="/calculators">Explore all calculators <ArrowRight size={17} /></Link>
        </div>
        <div className="tool-grid">{featured.map((calculator, index) => <CalculatorCard key={calculator.slug} calculator={calculator} index={index} />)}</div>
      </section>
      <MoneyJourney />
      <TrustPanel />
    </>
  )
}
