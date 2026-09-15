import type { CalculatorDefinition } from '../types/calculator'
import { borrowingCalculators } from './calculators/borrowing'
import { everydayCalculators } from './calculators/everyday'
import { investmentCalculators } from './calculators/investments'
import { planningCalculators } from './calculators/planning'

export const calculators: CalculatorDefinition[] = [
  ...investmentCalculators,
  ...borrowingCalculators,
  ...planningCalculators,
  ...everydayCalculators,
]

export const categories = ['All', 'Invest', 'Borrow', 'Earn', 'Plan', 'Everyday'] as const

export const getCalculator = (slug?: string) => calculators.find((calculator) => calculator.slug === slug)
