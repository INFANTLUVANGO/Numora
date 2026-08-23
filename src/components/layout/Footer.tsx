import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Logo } from '../common/Logo'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div>
          <Logo />
          <p>Clear financial decisions<br />for everyday India.</p>
        </div>
        <div className="site-footer__statement">
          <span className="eyebrow">One useful number at a time</span>
          <h2>Money decisions deserve more than a blank answer box.</h2>
        </div>
      </div>
      <div className="site-footer__links">
        <div><span>Explore</span><Link to="/calculators">All calculators</Link><Link to="/methodology">Methodology</Link></div>
        <div><span>NUMORA</span><Link to="/about">About</Link><Link to="/feedback">Feedback</Link></div>
        <div><span>Legal</span><Link to="/privacy">Privacy</Link><Link to="/disclaimer">Disclaimer</Link></div>
        <Link className="footer-cta" to="/calculators">Open decision desk <ArrowUpRight size={18} /></Link>
      </div>
      <div className="site-footer__bottom">
        <span>© 2026 NUMORA</span>
        <span>Estimates, not financial advice.</span>
        <span>Made for India · ₹</span>
      </div>
    </footer>
  )
}
