import { BookOpenCheck, CalendarClock, CircleGauge, ShieldCheck } from 'lucide-react'

const items = [
  { icon: BookOpenCheck, title: 'Method shown', text: 'Formulas and assumptions stay visible.' },
  { icon: CalendarClock, title: 'Rules dated', text: 'Financial-year logic is clearly labelled.' },
  { icon: CircleGauge, title: 'Limits stated', text: 'You see what the estimate leaves out.' },
  { icon: ShieldCheck, title: 'Private by default', text: 'No account, database or saved personal data.' },
]

export function TrustPanel() {
  return (
    <section className="trust-panel section-shell">
      <div className="trust-panel__lead"><span className="eyebrow">The trust layer</span><h2>Clarity includes<br />showing the fine print.</h2><p>Every result has a visible method, dated assumptions and honest limitations.</p></div>
      <div className="trust-panel__grid">
        {items.map(({ icon: Icon, title, text }) => <article key={title}><Icon size={24} /><div><h3>{title}</h3><p>{text}</p></div></article>)}
      </div>
    </section>
  )
}
