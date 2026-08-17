import { MockForm } from '../components/forms/MockForm'

export function FeedbackPage() {
  return <div className="form-page section-shell"><div className="form-page__intro"><span className="page-index">FEEDBACK / FRONTEND DEMO</span><h1>Help make the next decision clearer.</h1><p>Tell us what felt useful, confusing or missing. The current form demonstrates the future interaction and does not submit data.</p></div><MockForm buttonLabel="Preview submission" fields={[{ label: 'What were you using?', name: 'area', type: 'select', placeholder: 'Choose an area', options: ['Homepage and search', 'A calculator', 'Results and insights', 'PDF download', 'Other'] }, { label: 'Your feedback', name: 'feedback', type: 'textarea', placeholder: 'What should NUMORA improve?' }, { label: 'Email (optional in future)', name: 'email', type: 'email', placeholder: 'you@example.com' }]} /></div>
}
