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
