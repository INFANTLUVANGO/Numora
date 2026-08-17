import { ArrowRight, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchCalculators } from '../../data/calculators'
import { NumoraIcon } from '../common/NumoraIcon'

export function SearchDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const results = searchCalculators(query).slice(0, 6)

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  if (!open) return null

  return (
    <div className="search-drawer" role="dialog" aria-modal="true" aria-label="Search calculators">
      <button className="search-drawer__backdrop" onClick={onClose} aria-label="Close search" />
      <div className="search-drawer__panel">
        <div className="search-drawer__head">
          <span className="eyebrow">Find your next decision</span>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <label className="search-box">
          <Search size={24} />
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “SIP for 1 crore” or “home EMI”" />
        </label>
        <div className="search-drawer__results">
          {results.map((calculator) => (
            <Link key={calculator.slug} to={`/calculators/${calculator.slug}`} onClick={onClose}>
              <span className={`mini-icon mini-icon--${calculator.accent}`}><NumoraIcon name={calculator.icon} size={20} /></span>
              <span><strong>{calculator.title}</strong><small>{calculator.question}</small></span>
              <ArrowRight size={17} />
            </Link>
          ))}
          {results.length === 0 && <p className="empty-note">No exact match yet. Try a shorter money question.</p>}
        </div>
      </div>
    </div>
  )
}
