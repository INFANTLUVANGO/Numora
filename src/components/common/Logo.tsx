import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link className="logo" to="/" aria-label="NUMORA home">
      <span className="logo__mark" aria-hidden="true"><i>N</i></span>
      <span className="logo__word">NUMORA</span>
    </Link>
  )
}
