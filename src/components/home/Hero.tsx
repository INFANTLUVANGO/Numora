import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Hero() {
  return (
    <section className="home-hero section-shell">
      <div className="home-hero__copy">
              <div className="hero-kicker"><span>India-first decision tools</span><i>12 calculators · no sign-up</i></div>
        <h1>Money,<br /><em>made clear.</em></h1>
        <p>Calculate the number. Understand the trade-off. Take the next step—with tools built around how India earns, saves and plans.</p>
        <div className="hero-actions">
          <Link className="primary-button" to="/journey">Start with a goal <ArrowRight size={17} /></Link>
          <Link className="text-link" to="/calculators">Explore calculators <ArrowRight size={17} /></Link>
        </div>
      </div>

      <div className="decision-sheet" aria-label="Example financial decision card">
        <div className="decision-sheet__edge"><span>NUMORA / 001</span><span>DECISION NOTE</span></div>
        <div className="decision-sheet__header">
          <span className="signal-dot"><Sparkles size={15} /></span>
          <div><small>GOAL</small><strong>Build ₹1 crore</strong></div>
          <i>15Y</i>
        </div>
        <div className="decision-sheet__number">
          <small>MONTHLY SIP NEEDED</small>
          <strong>₹19,819</strong>
          <span>at 12% estimated return</span>
        </div>
        <div className="decision-chart">
          {[24, 31, 37, 45, 54, 66, 82, 100].map((height, index) => <i key={height} style={{ height: `${height}%`, animationDelay: `${index * 70}ms` }} />)}
        </div>
        <div className="decision-sheet__legend"><span><i />Invested · ₹36L</span><span><i />Growth · ₹64L</span></div>
        <div className="decision-sheet__note">
          <b>NUMORA NOTE</b>
          <p>Starting five years later could nearly double the monthly amount needed.</p>
        </div>
        <div className="decision-sheet__stamp">ESTIMATE<br /><strong>01</strong></div>
      </div>
    </section>
  )
}
