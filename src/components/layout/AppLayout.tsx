import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../redux/hooks'
import { Footer } from './Footer'
import { Header } from './Header'

export function AppLayout() {
  const theme = useAppSelector((state) => state.ui.theme)
  const { pathname } = useLocation()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'verdant' ? '#f3f0e5' : '#171b19')
  }, [theme])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  return (
    <div className="app-shell">
      <Header />
      <main><Outlet /></main>
      <Footer />
    </div>
  )
}
