import { ArrowRight, BadgeIndianRupee, House, PiggyBank, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'

const paths = [
  { title: 'Make income usable', text: 'Decode CTC, understand fixed pay, then shape a monthly budget.', icon: BadgeIndianRupee, link: '/calculators/salary-calculator', code: 'EARN' },
  { title: 'Build financial cover', text: 'Turn monthly expenses into an emergency target and funding plan.', icon: PiggyBank, link: '/calculators/emergency-fund-calculator', code: 'PROTECT' },
  { title: 'Plan a home', text: 'Find a practical home budget before comparing loans and EMIs.', icon: House, link: '/calculators/home-affordability-calculator', code: 'BORROW' },
  { title: 'Grow toward a goal', text: 'Translate a future corpus into a monthly investing habit.', icon: Sprout, link: '/calculators/sip-calculator', code: 'GROW' },
]

export function DecisionPaths() {
  return (
    <section className="decision-paths section-shell">
      <div className="section-heading section-heading--split">
        <div><span className="eyebrow">Start with your decision</span><h2>You don’t need to know the calculator’s name.</h2></div>
        <p>Choose the life question. NUMORA connects the useful numbers around it.</p>
      </div>
      <div className="path-grid">
        {paths.map(({ title, text, icon: Icon, link, code }, index) => (
          <Link to={link} className="path-card" key={title}>
            <span className="path-card__code">0{index + 1} / {code}</span>
            <Icon size={30} strokeWidth={1.5} />
            <h3>{title}</h3>
            <p>{text}</p>
            <span className="path-card__link">Open the path <ArrowRight size={16} /></span>
          </Link>
        ))}
      </div>
    </section>
  )
}
