import { ArrowRight, BadgeIndianRupee, GitCompareArrows, House, Target } from 'lucide-react'
import { Link } from 'react-router-dom'

const highlights = [
  {
    label: 'CALCULATE + GOAL',
    title: 'Solve the same question both ways.',
    text: 'Project what your money may become, or begin with a target and work backwards.',
    action: 'Try SIP planning',
    link: '/calculators/sip-calculator',
    icon: Target,
  },
  {
    label: 'PIN + COMPARE',
    title: 'Keep the better plan in view.',
    text: 'Pin important results, change the inputs and compare plans without leaving the calculator.',
    action: 'Compare EMI plans',
    link: '/calculators/emi-calculator',
    icon: GitCompareArrows,
  },
  {
    label: 'INDIA-FIRST',
    title: 'Numbers designed for how India reads money.',
    text: 'Use INR, lakh and crore formatting with relevant salary and finance assumptions.',
    action: 'Explore salary planning',
    link: '/calculators/salary-calculator',
    icon: BadgeIndianRupee,
  },
]

export function DecisionPaths() {
  return (
    <section className="decision-paths section-shell">
      <div className="section-heading section-heading--split">
        <div><span className="eyebrow">What NUMORA does differently</span><h2>The useful parts,<br />right up front.</h2></div>
        <p>Start with a complete decision experience, or use the features that make individual calculators more useful.</p>
      </div>

      <div className="numora-showcase">
        <Link to="/journey" className="numora-showcase__feature">
          <div className="numora-showcase__feature-top">
            <span>NUMORA FEATURE / 01</span>
            <i>BEST PLACE TO START</i>
          </div>
          <div className="numora-showcase__feature-icon"><House size={28} strokeWidth={1.6} /></div>
          <span className="numora-showcase__feature-label">GUIDED HOME JOURNEY</span>
          <h3>A home decision, not disconnected calculations.</h3>
          <p>Check a home, find a comfortable budget, or compare buying with renting and investing—all inside one journey.</p>
          <div className="numora-showcase__steps" aria-label="Home Journey includes">
            <span>Affordability</span><ArrowRight size={14} /><span>Comfort budget</span><ArrowRight size={14} /><span>Buy vs rent</span>
          </div>
          <span className="numora-showcase__feature-link">Explore the Home Journey <ArrowRight size={17} /></span>
        </Link>

        <div className="numora-showcase__highlights">
          {highlights.map(({ label, title, text, action, link, icon: Icon }, index) => (
            <Link to={link} className="numora-highlight" key={label}>
              <div className="numora-highlight__number">0{index + 2}</div>
              <div className="numora-highlight__icon"><Icon size={21} strokeWidth={1.7} /></div>
              <div className="numora-highlight__copy">
                <span>{label}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <span className="numora-highlight__link">{action} <ArrowRight size={16} /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
