export type CalculatorMode = 'calculate' | 'goal'
export type ResultKind = 'currency' | 'percentage' | 'number' | 'months' | 'years'

export interface SelectOption {
  label: string
  value: number
}

export interface InputField {
  key: string
  label: string
  type?: 'number' | 'select' | 'checkbox' | 'text'
  prefix?: string
  currencyField?: string
  suffix?: string
  min?: number
  max?: number
  step?: number
  hint?: string
  placeholder?: string
  section?: string
  options?: SelectOption[]
}

export interface ResultItem {
  label: string
  value: number
  displayValue?: string
  kind?: ResultKind
  tone?: 'default' | 'positive' | 'warning'
}

export interface ChartItem {
  label: string
  value: number
  displayValue?: string
  color?: string
}

export interface CalculatorResult {
  primary: ResultItem
  summary: string
  breakdown: ResultItem[]
  insights: string[]
  chart?: ChartItem[]
  chartTitle?: string
}

export interface CalculatorDefinition {
  slug: string
  title: string
  shortTitle: string
  category: 'Invest' | 'Borrow' | 'Earn' | 'Plan' | 'Everyday'
  eyebrow: string
  description: string
  question: string
  icon: string
  accent: 'vermilion' | 'teal' | 'blue' | 'gold' | 'violet'
  tags: string[]
  modes: CalculatorMode[]
  comparison?: boolean
  fields: InputField[]
  goalFields?: InputField[]
  defaults: Record<string, number>
  textDefaults?: Record<string, string>
  goalDefaults?: Record<string, number>
  calculate: (inputs: Record<string, number>, mode: 'calculate' | 'goal') => CalculatorResult
  assumptions: string[]
  related: string[]
  reviewed: string
  sourceLabel?: string
  sourceUrl?: string
}

export interface SavedScenario {
  id: string
  calculatorSlug: string
  mode: CalculatorMode
  name: string
  inputs: Record<string, number>
  result: CalculatorResult
}
