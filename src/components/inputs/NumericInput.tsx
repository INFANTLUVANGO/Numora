import { useEffect, useRef, useState } from 'react'

interface NumericInputProps {
  id: string
  value: number
  onChange: (value: number) => void
  prefix?: string
  suffix?: string
  min?: number
  max?: number
  decimal?: boolean
  formatThousands?: boolean
  className?: string
}

const formatValue = (value: number, decimal: boolean, formatThousands: boolean) => {
  if (!Number.isFinite(value)) return '0'
  if (!formatThousands) return decimal ? String(value) : String(Math.round(value))
  return value.toLocaleString('en-IN', { maximumFractionDigits: decimal ? 2 : 0 })
}

const cleanValue = (raw: string, decimal: boolean) => {
  const withoutCommas = raw.replace(/,/g, '')
  if (!decimal) return withoutCommas.replace(/\D/g, '').replace(/^0+(?=\d)/, '')

  const filtered = withoutCommas.replace(/[^\d.]/g, '')
  const [whole = '', ...fractionParts] = filtered.split('.')
  const cleanWhole = whole.replace(/^0+(?=\d)/, '') || (filtered.startsWith('.') ? '0' : '')
  const hasDecimal = filtered.includes('.')
  const fraction = fractionParts.join('').slice(0, 2)
  return hasDecimal ? `${cleanWhole}.${fraction}` : cleanWhole
}

export function NumericInput({ id, value, onChange, prefix, suffix, min, max, decimal = false, formatThousands = false, className = 'number-input' }: NumericInputProps) {
  const [draft, setDraft] = useState(() => formatValue(value, decimal, formatThousands))
  const focused = useRef(false)

  useEffect(() => {
    if (!focused.current) setDraft(formatValue(value, decimal, formatThousands))
  }, [decimal, formatThousands, value])

  const update = (raw: string) => {
    const cleaned = cleanValue(raw, decimal)
    setDraft(cleaned)
    const parsed = Number(cleaned)
    onChange(cleaned === '' || cleaned === '0.' || !Number.isFinite(parsed) ? 0 : parsed)
  }

  const finishEditing = () => {
    focused.current = false
    let next = Number(draft.replace(/,/g, ''))
    if (!Number.isFinite(next)) next = 0
    if (!decimal) next = Math.round(next)
    if (min !== undefined) next = Math.max(min, next)
    if (max !== undefined) next = Math.min(max, next)
    onChange(next)
    setDraft(formatValue(next, decimal, formatThousands))
  }

  return (
    <div className={className}>
      {prefix && <span>{prefix}</span>}
      <input
        id={id}
        type="text"
        inputMode={decimal ? 'decimal' : 'numeric'}
        autoComplete="off"
        value={draft}
        onFocus={() => { focused.current = true }}
        onChange={(event) => update(event.target.value)}
        onBlur={finishEditing}
      />
      {suffix && <span>{suffix}</span>}
    </div>
  )
}
