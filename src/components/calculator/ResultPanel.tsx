import { ArrowRight, Check, Download, Lightbulb, LoaderCircle, TriangleAlert, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import type { CalculatorResult, SavedScenario } from '../../types/calculator'
import { formatResult } from '../../utils/formatters'
import { PinnedComparison } from './ScenarioCompare'

interface NextStep {
  eyebrow: string
  title: string
  description: string
  action: string
  onClick: () => void
}

interface Comparison {
  enabled: boolean
  calculatorLabel: string
  currentScenario?: SavedScenario
  scenarios: SavedScenario[]
  canAdd: boolean
  onAdd: () => void
  onRemove: (id: string) => void
}

export function ResultPanel({ result, onDownload, nextStep, comparison, isFresh }: { result: CalculatorResult; onDownload: () => Promise<void>; nextStep?: NextStep; comparison?: Comparison; isFresh?: boolean }) {
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const total = result.chart?.reduce((sum, item) => sum + Math.max(0, item.value), 0) || 1
  let cursor = 0
  const gradient = result.chart?.map((item) => {
    const start = (cursor / total) * 100
    cursor += Math.max(0, item.value)
    const end = (cursor / total) * 100
    return `${item.color} ${start}% ${end}%`
  }).join(', ')

  const downloadPdf = async () => {
    if (downloadStatus === 'working') return
    setDownloadStatus('working')
    try {
      await onDownload()
      setDownloadStatus('done')
      window.setTimeout(() => setDownloadStatus('idle'), 2200)
    } catch (error) {
      console.error('NUMORA PDF export failed', error)
      setDownloadStatus('error')
    }
  }

  const DownloadIcon = downloadStatus === 'working' ? LoaderCircle : downloadStatus === 'done' ? Check : downloadStatus === 'error' ? TriangleAlert : Download
  const downloadLabel = downloadStatus === 'working' ? 'Preparing PDF' : downloadStatus === 'done' ? 'PDF downloaded' : downloadStatus === 'error' ? 'Try PDF again' : 'Download PDF'

  return (
    <div className="result-panel">
      <div className="result-panel__top">
        <span className="result-panel__label"><i /><span>YOUR NUMORA RESULT</span></span>
        <button className={`download-button ${downloadStatus === 'working' ? 'is-loading' : ''} ${downloadStatus === 'error' ? 'is-error' : ''}`} type="button" disabled={downloadStatus === 'working'} onClick={downloadPdf}><DownloadIcon size={16} /> {downloadLabel}</button>
      </div>
      {comparison?.enabled && <PinnedComparison calculatorLabel={comparison.calculatorLabel} currentScenario={comparison.currentScenario} scenarios={comparison.scenarios} canAdd={comparison.canAdd} onAdd={comparison.onAdd} onRemove={comparison.onRemove} />}
      {isFresh ? <div className="scenario-ready"><span>NEW PLAN</span><strong>Enter values to compare another plan.</strong></div> : <>
        <div className="primary-result">
          <small>{result.primary.label}</small>
          <strong>{result.primary.displayValue ?? formatResult(result.primary.value, result.primary.kind)}</strong>
          <p>{result.summary}</p>
        </div>
        <div className="result-breakdown">
          {result.breakdown.map((item) => <div key={item.label}><span>{item.label}</span><strong className={item.tone ? `is-${item.tone}` : ''}>{item.displayValue ?? formatResult(item.value, item.kind)}</strong></div>)}
        </div>
        {result.chart && (
          <div className="result-visual">
            <div className="donut" style={{ background: `conic-gradient(${gradient})` }}><span><TrendingUp size={18} /></span></div>
            <div>{result.chartTitle && <span className="result-visual__title">{result.chartTitle}</span>}{result.chart.map((item) => <div key={item.label}><i style={{ backgroundColor: item.color }} /><span>{item.label}</span><strong>{item.displayValue ?? formatResult(item.value, 'currency')}</strong></div>)}</div>
          </div>
        )}
        <div className="result-insights">
          <div className="result-insights__title"><Lightbulb size={18} /><span>WHAT THIS MEANS</span></div>
          {result.insights.map((insight) => <p key={insight}>{insight}</p>)}
        </div>
        {nextStep && (
          <div className="result-next-step">
            <div><span>{nextStep.eyebrow}</span><strong>{nextStep.title}</strong><p>{nextStep.description}</p></div>
            <button type="button" onClick={nextStep.onClick}>{nextStep.action} <ArrowRight size={16} /></button>
          </div>
        )}
      </>}
    </div>
  )
}
