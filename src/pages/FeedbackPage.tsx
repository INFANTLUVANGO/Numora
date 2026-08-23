import { Check, LockKeyhole } from 'lucide-react'
import { FeedbackForm } from '../components/forms/FeedbackForm'

export function FeedbackPage() {
  return (
    <div className="feedback-page section-shell">
      <div className="feedback-page__intro">
        <span className="page-index">FEEDBACK / DIRECT TO NUMORA</span>
        <h1>One clear note can improve the next decision.</h1>
        <p>Share what worked, what felt confusing, or what should become more useful.</p>
        <div className="feedback-page__trust"><LockKeyhole size={18} /><span><strong>Your calculations stay private.</strong><small>NUMORA sends only the feedback written here and your email so we can identify or reply to the message.</small></span></div>
        <div className="feedback-page__points"><span><Check size={14} /> No account required</span><span><Check size={14} /> Reply-ready feedback</span></div>
      </div>
      <FeedbackForm />
    </div>
  )
}
