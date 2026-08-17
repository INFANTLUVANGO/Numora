import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AboutPage() {
  return (
    <div className="editorial-page section-shell">
      <header className="editorial-hero"><span className="page-index">ABOUT / 01</span><h1>Better money decisions begin with a number you can understand.</h1><p>NUMORA is an India-first financial decision platform for people who want clarity without a spreadsheet, sales pitch or sign-up wall.</p></header>
      <section className="editorial-grid">
        <div><span className="eyebrow">Why it exists</span></div>
        <div><h2>Calculators often stop exactly where the useful part begins.</h2><p>A number without context leaves the real question unanswered: is it manageable, what changes it, and what should I explore next? NUMORA turns each calculation into a short decision note—with assumptions, trade-offs and connected next steps.</p></div>
      </section>
      <section className="value-grid">
        <article><span>01</span><h3>India, by default</h3><p>Rupees, lakh and crore, Indian salary structures and India-specific assumptions.</p></article>
        <article><span>02</span><h3>Explanation over spectacle</h3><p>Useful hierarchy, honest assumptions and plain-language insights.</p></article>
        <article><span>03</span><h3>Private by default</h3><p>V1 stores no personal calculation history or user profile.</p></article>
      </section>
      <Link className="primary-button" to="/calculators">Open the decision desk <ArrowRight size={18} /></Link>
    </div>
  )
}
