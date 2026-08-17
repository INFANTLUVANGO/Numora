import { Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CalculatorCard } from '../components/common/CalculatorCard'
import { calculators, categories, searchCalculators } from '../data/calculators'

export function CalculatorsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof categories)[number]>('All')
  const filtered = useMemo(() => searchCalculators(query).filter((calculator) => category === 'All' || calculator.category === category), [category, query])

  return (
    <div className="directory-page section-shell">
      <header className="directory-hero">
        <span className="page-index">DECISION DESK / {String(calculators.length).padStart(2, '0')} TOOLS</span>
        <h1>Find the number behind your next decision.</h1>
        <p>Search naturally, browse by money moment, then calculate, work backwards or compare.</p>
        <label className="directory-search"><Search size={23} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “monthly EMI” or “how much for retirement?”" /><span>{filtered.length} results</span></label>
      </header>
      <div className="directory-controls">
        <span><SlidersHorizontal size={16} /> Filter by decision</span>
        <div>{categories.map((item) => <button className={category === item ? 'is-active' : ''} type="button" key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>
      </div>
      {filtered.length > 0 ? <div className="directory-grid">{filtered.map((calculator, index) => <CalculatorCard calculator={calculator} index={index} key={calculator.slug} />)}</div> : <div className="directory-empty"><span>NO MATCH / YET</span><h2>That money question is not on the desk yet.</h2><p>Try fewer words or request the calculator you need.</p></div>}
    </div>
  )
}
