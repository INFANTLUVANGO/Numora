import { ArrowRight, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchDecisions } from '../../data/search'
import { NumoraIcon } from '../common/NumoraIcon'

export function SearchDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const results = searchDecisions(query).slice(0, 6)

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  if (!open) return null

  return (
    <div className="search-drawer" role="dialog" aria-modal="true" aria-label="Find a decision">
      <button className="search-drawer__backdrop" onClick={onClose} aria-label="Close search" />
      <div className="search-drawer__panel">
        <div className="search-drawer__head">
          <span className="eyebrow">Find a decision</span>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <label className="search-box">
          <Search size={24} />
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “Can I afford a home?” or “SIP for 1 crore”" />
        </label>
        <div className="search-drawer__results">
          {results.map((calculator) => (
            <Link key={`${calculator.kind}-${calculator.slug}`} to={calculator.path} onClick={onClose}>
              <span className={`mini-icon mini-icon--${calculator.accent}`}><NumoraIcon name={calculator.icon} size={20} /></span>
              <span><strong>{calculator.title}</strong><small>{calculator.kind === 'journey' ? `Journey · ${calculator.question}` : `Calculator · ${calculator.question}`}</small></span>
              <ArrowRight size={17} />
            </Link>
          ))}
          {results.length === 0 && <p className="empty-note">No match yet. Try a shorter money question.</p>}
        </div>
      </div>
    </div>
  )
}
