export function LegalPage({ type }: { type: 'privacy' | 'disclaimer' }) {
  const privacy = type === 'privacy'
  return (
    <div className="editorial-page section-shell legal-page">
      <header className="editorial-hero"><span className="page-index">{privacy ? 'PRIVACY' : 'DISCLAIMER'} / 01</span><h1>{privacy ? 'Private by design in Version 1.' : 'Useful estimates, with honest limits.'}</h1><p>{privacy ? 'NUMORA currently runs entirely in your browser and does not create a user profile.' : 'NUMORA helps you explore scenarios. It does not replace professional financial, tax or legal advice.'}</p></header>
      <section className="legal-copy">
        {privacy ? <>
          <h2>What is stored</h2><p>No account, calculation history, favourites or personal profile is stored by NUMORA. Refreshing the application clears active calculation state.</p>
          <h2>Mock forms</h2><p>Feedback and calculator-request forms currently demonstrate frontend interaction only. Their contents are not transmitted or stored.</p>
          <h2>PDF downloads</h2><p>PDFs are generated locally in the browser from the result currently visible to you.</p>
        </> : <>
          <h2>Estimates only</h2><p>Calculations use the values and assumptions you provide. Actual taxes, investment returns, loan offers, fees and salary structures may differ.</p>
          <h2>No recommendation</h2><p>Results do not recommend a financial product, tax position, investment, loan or course of action.</p>
          <h2>Review before acting</h2><p>For high-impact decisions, verify applicable rules and consult a qualified professional.</p>
        </>}
      </section>
    </div>
  )
}
