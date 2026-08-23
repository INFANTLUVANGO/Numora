import { RotateCcw } from 'lucide-react'
import { Fragment } from 'react'
import type { InputField } from '../../types/calculator'
import { getCurrencySymbol } from '../../utils/formatters'
import { NumericInput } from '../inputs/NumericInput'

interface CalculatorFormProps {
  fields: InputField[]
  values: Record<string, number>
  textValues?: Record<string, string>
  onChange: (key: string, value: number) => void
  onTextChange: (key: string, value: string) => void
  onReset: () => void
}

export function CalculatorForm({ fields, values, textValues = {}, onChange, onTextChange, onReset }: CalculatorFormProps) {
  return (
    <div className="calculator-form">
      <div className="calculator-form__head"><div><span>YOUR INPUTS</span><small>Adjust the numbers to match your situation.</small></div><button type="button" onClick={onReset}><RotateCcw size={14} /> Reset</button></div>
      <div className="calculator-form__fields">
        {fields.map((field, index) => (
          <Fragment key={field.key}>
          {field.section && (index === 0 || fields[index - 1].section !== field.section) && <div className="field-section"><span>{field.section}</span></div>}
          <div className={`field-block${field.type === 'checkbox' ? ' field-block--checkbox' : ''}`}>
            {field.type === 'checkbox' ? (
              <label className="checkbox-field" htmlFor={field.key}>
                <input id={field.key} type="checkbox" checked={values[field.key] === 1} onChange={(event) => onChange(field.key, event.target.checked ? 1 : 0)} />
                <span><strong>{field.label}</strong>{field.hint && <small>{field.hint}</small>}</span>
              </label>
            ) : (
              <>
                <label htmlFor={field.key}>{field.label}</label>
                {field.type === 'text' ? (
                  <input className="text-input" id={field.key} type="text" value={textValues[field.key] ?? ''} placeholder={field.placeholder} onChange={(event) => onTextChange(field.key, event.target.value)} />
                ) : field.type === 'select' ? (
                  <select id={field.key} value={values[field.key]} onChange={(event) => onChange(field.key, Number(event.target.value))}>
                    {field.options?.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
                  </select>
                ) : (
                  <>
                    <NumericInput id={field.key} value={values[field.key] ?? 0} onChange={(value) => onChange(field.key, value)} prefix={field.currencyField ? getCurrencySymbol(values[field.currencyField]) : field.prefix} suffix={field.suffix} min={field.min} max={field.max} decimal={field.decimal} formatThousands={Boolean(field.prefix || field.currencyField)} />
                    {field.max !== undefined && <input className="range-input" type="range" aria-label={`${field.label} slider`} min={field.min ?? 0} max={field.max} step={field.step ?? 1} value={values[field.key] ?? 0} onChange={(event) => onChange(field.key, Number(event.target.value))} />}
                  </>
                )}
                {field.hint && <small>{field.hint}</small>}
              </>
            )}
          </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
