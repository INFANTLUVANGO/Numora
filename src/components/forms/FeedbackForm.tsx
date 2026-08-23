import { CheckCircle2, LoaderCircle, MessageSquareText, Send, TriangleAlert } from 'lucide-react'
import { type SubmitEvent, useState } from 'react'

const FORM_URL = 'https://formspree.io/f/movenkrw'

export function FeedbackForm() {
  const [feedback, setFeedback] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'sending') return
    setStatus('sending')

    try {
      const response = await fetch(FORM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ feedback, email, source: 'NUMORA feedback' }),
      })

      if (!response.ok) throw new Error('Formspree rejected the submission.')
      setFeedback('')
      setEmail('')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="feedback-success">
        <CheckCircle2 size={42} />
        <span>FEEDBACK RECEIVED</span>
        <h2>Your note reached NUMORA.</h2>
        <p>Thank you. Clear feedback helps us improve the next financial decision.</p>
        <button className="secondary-button" type="button" onClick={() => setStatus('idle')}>Write another note</button>
      </div>
    )
  }

  return (
    <form className="feedback-form" onSubmit={submit}>
      <div className="feedback-form__head">
        <div><MessageSquareText size={21} /></div>
        <span>YOUR NOTE / PRIVATE FROM CALCULATIONS</span>
        <b>01</b>
      </div>

      <label className="feedback-form__message">
        <span>What should NUMORA improve?</span>
        <textarea value={feedback} onChange={(event) => { setFeedback(event.target.value); setStatus('idle') }} required minLength={10} maxLength={1200} rows={9} placeholder="Tell us what felt useful, confusing or missing..." />
        <small>{feedback.length} / 1200</small>
      </label>

      <label className="feedback-form__email">
        <span>Your email</span>
        <input value={email} onChange={(event) => { setEmail(event.target.value); setStatus('idle') }} required type="email" name="email" autoComplete="email" placeholder="you@example.com" />
      </label>

      <div className="feedback-form__foot">
        <p>Only this note and your email are sent. Your calculator values stay in the browser.</p>
        <button type="submit" disabled={status === 'sending'}>{status === 'sending' ? <LoaderCircle className="is-spinning" size={17} /> : <Send size={17} />}{status === 'sending' ? 'Sending' : 'Send feedback'}</button>
      </div>

      {status === 'error' && <div className="feedback-form__error" role="alert"><TriangleAlert size={17} />The note could not be sent. Please try again.</div>}
    </form>
  )
}
