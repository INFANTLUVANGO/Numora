import { ArrowRight, Search, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { searchCalculators } from '../../data/calculators'

export function Hero() {
  const [query, setQuery] = useState('')
  const results = query.trim() ? searchCalculators(query).slice(0, 4) : []

  return (
    <section className="home-hero section-shell">
      <div className="home-hero__copy">
              <div className="hero-kicker"><span>India-first decision tools</span><i>15 calculators · no sign-up</i></div>
        <h1>Money,<br /><em>made clear.</em></h1>
        <p>Calculate the number. Understand the trade-off. Take the next step—with tools built around how India earns, saves and plans.</p>
        <div className="hero-search-wrap">
          <label className="hero-search">
            <Search size={22} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What are you trying to figure out?" />
            <span>⌘ K</span>
          </label>
          {results.length > 0 && (
            <div className="hero-search-results">
              {results.map((calculator) => (
                <Link key={calculator.slug} to={`/calculators/${calculator.slug}`}>
                  <span>{calculator.question}</span><ArrowRight size={16} />
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="hero-prompts">
          <span>Try asking</span>
          {['SIP for 1 crore', 'Can I afford a home?', 'How much should I save for a trip?'].map((prompt) => <button type="button" key={prompt} onClick={() => setQuery(prompt)}>{prompt}</button>)}
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
