import { Menu, Moon, Search, Sun, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Logo } from '../common/Logo'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { toggleTheme } from '../../redux/uiSlice'
import { SearchDrawer } from './SearchDrawer'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const theme = useAppSelector((state) => state.ui.theme)
  const dispatch = useAppDispatch()
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Logo />
          <nav className={`site-nav${menuOpen ? ' is-open' : ''}`} aria-label="Primary navigation">
            <NavLink to="/calculators">Calculators</NavLink>
            <NavLink to="/methodology">How it works</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink className="site-nav__request" to="/request-calculator">Request a tool</NavLink>
          </nav>
          <div className="site-header__actions">
            <button className="icon-button" type="button" onClick={() => setSearchOpen(true)} aria-label="Search calculators"><Search size={19} /></button>
            <button className="icon-button" type="button" onClick={() => dispatch(toggleTheme())} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button className="icon-button site-header__menu" type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle menu">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>
      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
