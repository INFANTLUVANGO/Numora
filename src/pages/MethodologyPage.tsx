import { Check, EqualApproximately, FileCheck2, TestTube2 } from 'lucide-react'

export function MethodologyPage() {
  return (
    <div className="editorial-page section-shell">
      <header className="editorial-hero"><span className="page-index">METHOD / 01</span><h1>Every estimate should explain how it got there.</h1><p>NUMORA separates calculation logic from presentation and gives each tool a visible trust record.</p></header>
      <div className="method-steps">
        {[
          { icon: EqualApproximately, title: 'Pure calculation', text: 'Inputs pass into testable functions with explicit units and rounding rules.' },
          { icon: TestTube2, title: 'Boundary checks', text: 'Zero rates, short durations and unusual values are handled deliberately.' },
          { icon: FileCheck2, title: 'Dated assumptions', text: 'Rules that change over time are labelled by financial or assessment year.' },
          { icon: Check, title: 'Plain-language result', text: 'The output states the main number, breakdown, limitations and a useful next step.' },
        ].map(({ icon: Icon, title, text }, index) => <article key={title}><span>0{index + 1}</span><Icon size={26} /><h2>{title}</h2><p>{text}</p></article>)}
      </div>
      <section className="editorial-grid"><div><span className="eyebrow">Important</span></div><div><h2>NUMORA provides estimates, not financial advice.</h2><p>Results depend on the information and assumptions entered. Investment returns are uncertain, tax situations vary, and lenders or employers may use different rules. Use the methodology panel on each calculator before making a material decision.</p></div></section>
    </div>
  )
}
