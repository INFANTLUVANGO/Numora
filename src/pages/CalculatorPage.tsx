import { useParams } from 'react-router-dom'
import { CalculatorWorkspace } from '../components/calculator/CalculatorWorkspace'
import { getCalculator } from '../data/calculators'
import { NotFoundPage } from './NotFoundPage'

export function CalculatorPage() {
  const { slug } = useParams()
  const calculator = getCalculator(slug)

  if (!calculator) return <NotFoundPage />

  return <CalculatorWorkspace calculator={calculator} />
}
