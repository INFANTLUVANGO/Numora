import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return <div className="not-found section-shell"><span>404 / OFF THE LEDGER</span><h1>Oops this doesn’t lead anywhere.</h1><p>The page may have moved, but your next decision is still waiting.</p><Link className="primary-button" to="/"><ArrowLeft size={17} /> Back home</Link></div>
}
