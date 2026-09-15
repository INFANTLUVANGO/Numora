import type { InputField } from '../../types/calculator'

export const money = (key: string, label: string, hint?: string): InputField => ({ key, label, prefix: '₹', min: 0, step: 1000, hint })
export const percent = (key: string, label: string, min = 0, max = 50): InputField => ({ key, label, suffix: '%', min, max, step: 0.1, decimal: true })
export const years = (key: string, label: string, min = 1, max = 50): InputField => ({ key, label, suffix: 'years', min, max, step: 1 })
export const travelMoney = (key: string, label: string, section: string, hint?: string): InputField => ({ key, label, currencyField: 'currency', min: 0, step: 100, hint, section })
