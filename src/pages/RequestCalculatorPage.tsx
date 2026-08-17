import { MockForm } from '../components/forms/MockForm'

export function RequestCalculatorPage() {
  return <div className="form-page section-shell"><div className="form-page__intro"><span className="page-index">REQUEST / FRONTEND DEMO</span><h1>What should arrive on the decision desk next?</h1><p>Describe the question you want to answer. This V1 interaction stays in the browser and does not submit or store data.</p></div><MockForm buttonLabel="Preview request" fields={[{ label: 'Calculator or question', name: 'title', placeholder: 'e.g. How much should I save for education?' }, { label: 'Category', name: 'category', type: 'select', placeholder: 'Choose a category', options: ['Earn', 'Plan', 'Invest', 'Borrow', 'Everyday', 'Wedding / Event', 'Other'] }, { label: 'What should the result help you decide?', name: 'context', type: 'textarea', placeholder: 'A little context helps shape a better tool.' }]} /></div>
}
