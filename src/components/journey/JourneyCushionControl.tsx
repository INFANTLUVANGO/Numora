const cushionOptions = [10, 15, 20, 25]

export function JourneySurplusSave({ enabled, percent, onToggle, onPercentChange }: { enabled: boolean; percent: number; onToggle: (enabled: boolean) => void; onPercentChange: (percent: number) => void }) {
  return (
    <div className="journey-cushion">
      <div>
        <span>MONTHLY SURPLUS CUSHION</span>
        <strong>{enabled ? `Keep ${percent}% available for monthly flexibility.` : 'Use the full available amount for the home EMI.'}</strong>
      </div>
      <label className="journey-cushion__toggle">
        <input type="checkbox" checked={enabled} onChange={(event) => onToggle(event.target.checked)} />
        <span aria-hidden="true" />
        <b>{enabled ? 'On' : 'Off'}</b>
      </label>
      {enabled && (
        <div className="journey-cushion__choices" aria-label="Monthly surplus cushion percentage">
          {cushionOptions.map((option) => <button type="button" className={percent === option ? 'is-active' : ''} aria-pressed={percent === option} onClick={() => onPercentChange(option)} key={option}>{option}%</button>)}
        </div>
      )}
    </div>
  )
}
