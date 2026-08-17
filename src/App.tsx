import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { AboutPage } from './pages/AboutPage'
import { CalculatorPage } from './pages/CalculatorPage'
import { CalculatorsPage } from './pages/CalculatorsPage'
import { FeedbackPage } from './pages/FeedbackPage'
import { HomePage } from './pages/HomePage'
import { LegalPage } from './pages/LegalPage'
import { MethodologyPage } from './pages/MethodologyPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RequestCalculatorPage } from './pages/RequestCalculatorPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="calculators" element={<CalculatorsPage />} />
        <Route path="calculators/:slug" element={<CalculatorPage />} />
        <Route path="methodology" element={<MethodologyPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="privacy" element={<LegalPage type="privacy" />} />
        <Route path="disclaimer" element={<LegalPage type="disclaimer" />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="request-calculator" element={<RequestCalculatorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
