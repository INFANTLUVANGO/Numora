import { CheckCircle2, Send } from 'lucide-react'
import { type FormEvent, useState } from 'react'

export interface MockField {
  label: string
  name: string
  placeholder: string
  type?: 'text' | 'email' | 'textarea' | 'select'
  options?: string[]
}

export function MockForm({ fields, buttonLabel }: { fields: MockField[]; buttonLabel: string }) {
  const [submitted, setSubmitted] = useState(false)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
  }

  if (submitted) return <div className="mock-success"><CheckCircle2 size={38} /><span>FRONTEND DEMO</span><h2>Captured for the prototype.</h2><p>Nothing was sent or stored. This success state is ready to connect to a real service later.</p><button className="secondary-button" type="button" onClick={() => setSubmitted(false)}>Submit another</button></div>

  return (
    <form className="mock-form" onSubmit={submit}>
      {fields.map((field) => <label key={field.name}><span>{field.label}</span>{field.type === 'textarea' ? <textarea required placeholder={field.placeholder} rows={5} /> : field.type === 'select' ? <select required defaultValue=""><option value="" disabled>{field.placeholder}</option>{field.options?.map((option) => <option key={option}>{option}</option>)}</select> : <input required type={field.type ?? 'text'} placeholder={field.placeholder} />}</label>)}
      <p className="mock-form__note">Demo interaction only. This form does not transmit or store your response.</p>
      <button className="primary-button" type="submit">{buttonLabel} <Send size={17} /></button>
    </form>
  )
}
