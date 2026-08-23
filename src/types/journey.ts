export type JourneyIntent = 'check-home' | 'find-budget' | 'buy-vs-rent'
export type JourneyStatus = 'comfortable' | 'manageable' | 'tight' | 'not-ready'

export interface JourneyInputSpec {
  key: string
  label: string
  hint: string
  prefix?: string
  suffix?: string
  min?: number
  max?: number
  step?: number
  decimal?: boolean
}

export interface JourneyStepSpec {
  number: string
  eyebrow: string
  title: string
  description: string
  inputKeys: string[]
}

export interface JourneyCatalogOption {
  id: string
  label: string
  description: string
}

export interface JourneyDefinition {
  slug: string
  number: string
  category: string
  icon: string
  title: string
  description: string
  options: JourneyCatalogOption[]
}

export interface JourneyAlternative {
  id: string
  title: string
  description: string
  changes: Record<string, number>
  homePrice: number
  monthlyEmi: number
  monthlyRoom: number
  totalInterest: number
  tenureMonths: number
}

export interface HomeJourneyResult {
  intent: JourneyIntent
  homePrice: number
  downPayment: number
  loanAmount: number
  scheduledEmi: number
  extraMonthlyPayment: number
  monthlyEmi: number
  comfortableEmi: number
  availableForHomeEmi: number
  monthlyRoom: number
  projectedMonthlyCommitments: number
  maxComfortableHome: number
  maxCashflowHome: number
  cushionEnabled: boolean
  cushionPercent: number
  totalInterest: number
  tenureMonths: number
  sipProjection: {
    monthlyInvestment: number
    projectedCorpus: number
    totalInvested: number
    estimatedGains: number
    annualRate: number
    years: number
  }
  emergencyProjection: {
    goal: number
    monthlyContribution: number
    monthsToGoal: number
    coverageDuration: number
  }
  status: JourneyStatus
  statusTitle: string
  statusDescription: string
  reasons: string[]
  nextSteps: string[]
  alternatives: JourneyAlternative[]
}
