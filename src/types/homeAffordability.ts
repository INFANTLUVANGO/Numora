export type JourneyIntent = 'check-home' | 'find-budget' | 'buy-vs-rent'
export type JourneyStatus = 'comfortable' | 'manageable' | 'tight' | 'not-ready'

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
