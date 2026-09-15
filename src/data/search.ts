import type { CalculatorDefinition } from '../types/calculator'
import type { JourneyDefinition } from '../types/journey'
import { calculators } from './calculators'
import { journeyCatalog } from './journeys/catalog'

export interface DecisionSearchResult {
  kind: 'calculator' | 'journey'
  slug: string
  path: string
  title: string
  description: string
  question: string
  category: string
  icon: string
  accent: string
}

const calculatorResult = (calculator: CalculatorDefinition): DecisionSearchResult => ({
  kind: 'calculator',
  slug: calculator.slug,
  path: `/calculators/${calculator.slug}`,
  title: calculator.title,
  description: calculator.description,
  question: calculator.question,
  category: calculator.category,
  icon: calculator.icon,
  accent: calculator.accent,
})

const journeyResult = (journey: JourneyDefinition): DecisionSearchResult => ({
  kind: 'journey',
  slug: journey.slug,
  path: `/journey/${journey.slug}`,
  title: journey.title,
  description: journey.description,
  question: journey.options[0]?.label ?? 'Explore this journey',
  category: 'Journey',
  icon: journey.icon,
  accent: 'teal',
})

const decisions = [...journeyCatalog.map(journeyResult), ...calculators.map(calculatorResult)]

export function searchDecisions(query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return decisions

  const words = normalized.split(/\s+/)
  return decisions
    .map((decision) => {
      const extraText = decision.kind === 'journey'
        ? journeyCatalog.find((journey) => journey.slug === decision.slug)?.options.map((option) => `${option.label} ${option.description}`).join(' ')
        : calculators.find((calculator) => calculator.slug === decision.slug)?.tags.join(' ')
      const haystack = [decision.title, decision.description, decision.question, decision.category, extraText].join(' ').toLowerCase()
      const score = words.reduce((total, word) => total + (haystack.includes(word) ? 1 : 0), 0)
      return { decision, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ decision }) => decision)
}
