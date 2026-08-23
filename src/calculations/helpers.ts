export const toNonNegativeNumber = (value: number) => Math.max(0, Number.isFinite(value) ? value : 0)

export const annualPercentageToMonthlyRate = (annualRate: number) => annualRate / 1200
