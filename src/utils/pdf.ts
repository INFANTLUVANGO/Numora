import type { jsPDF as JsPdf } from 'jspdf'
import type { CalculatorDefinition, CalculatorResult, InputField } from '../types/calculator'
import { formatResult, getCurrencySymbol } from './formatters'

const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const MARGIN = 16
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const CONTENT_BOTTOM = 270
const COLORS = {
  paper: [242, 239, 231] as const,
  surface: [252, 250, 244] as const,
  forest: [22, 63, 58] as const,
  ink: [31, 36, 34] as const,
  muted: [95, 99, 94] as const,
  line: [205, 201, 190] as const,
  accent: [255, 92, 53] as const,
}

const pdfText = (value: string) => value
  .replaceAll('₹', 'INR ')
  .replaceAll('€', 'EUR ')
  .replaceAll('£', 'GBP ')
  .replaceAll('–', '-')
  .replaceAll('—', '-')
  .replaceAll('‑', '-')
  .replaceAll('·', '/')
  .replaceAll('’', "'")
  .replaceAll('“', '"')
  .replaceAll('”', '"')
  .replaceAll('\u00a0', ' ')
  .replace(/[^\x20-\x7E\n]/g, '')

const displayResult = (item: CalculatorResult['primary']) => pdfText(item.displayValue ?? formatResult(item.value, item.kind))

const displayInput = (field: InputField, inputs: Record<string, number | string>) => {
  const rawValue = inputs[field.key]
  const selectedOption = field.options?.find((option) => option.value === rawValue)

  if (field.type === 'checkbox') return rawValue === 1 ? 'Yes' : 'No'
  if (field.type === 'text') return String(rawValue ?? '')
  if (field.type === 'select') return selectedOption?.label ?? String(rawValue ?? '')

  const prefix = field.currencyField ? getCurrencySymbol(Number(inputs[field.currencyField])) : (field.prefix ?? '')
  const formatted = typeof rawValue === 'number' ? rawValue.toLocaleString('en-IN') : String(rawValue ?? '')
  return `${prefix}${formatted}${field.suffix ? ` ${field.suffix}` : ''}`
}

function paintPage(doc: JsPdf, continuation = false) {
  doc.setFillColor(...COLORS.paper)
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F')
  doc.setFillColor(...COLORS.forest)
  doc.rect(0, 0, PAGE_WIDTH, continuation ? 18 : 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(continuation ? 11 : 17)
  doc.text('NUMORA', MARGIN, continuation ? 12 : 18)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(continuation ? 'CALCULATION REPORT / CONTINUED' : 'CALCULATION REPORT / GENERATED IN YOUR BROWSER', PAGE_WIDTH - MARGIN, continuation ? 12 : 18, { align: 'right' })
}

function addFooters(doc: JsPdf, calculator: CalculatorDefinition) {
  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setDrawColor(...COLORS.forest)
    doc.line(MARGIN, 278, PAGE_WIDTH - MARGIN, 278)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.muted)
    doc.text(pdfText(`Reviewed ${calculator.reviewed} / Estimate only, not financial advice.`), MARGIN, 285)
    doc.text(`Page ${page} of ${pageCount}`, PAGE_WIDTH / 2, 285, { align: 'center' })
    doc.text('numora / money, made clear', PAGE_WIDTH - MARGIN, 285, { align: 'right' })
  }
}

async function createResultPdf(calculator: CalculatorDefinition, inputs: Record<string, number | string>, result: CalculatorResult) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  let y = 0

  const addPage = () => {
    doc.addPage()
    paintPage(doc, true)
    y = 29
  }

  const ensureSpace = (height: number) => {
    if (y + height > CONTENT_BOTTOM) addPage()
  }

  const sectionHeading = (title: string) => {
    ensureSpace(16)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.forest)
    doc.text(pdfText(title.toUpperCase()), MARGIN, y)
    doc.setDrawColor(...COLORS.line)
    doc.line(MARGIN + 48, y - 1, PAGE_WIDTH - MARGIN, y - 1)
    y += 8
  }

  const keyValueRows = (rows: Array<{ label: string; value: string }>) => {
    rows.forEach((row) => {
      const labelLines = doc.splitTextToSize(pdfText(row.label), 105) as string[]
      const valueLines = doc.splitTextToSize(pdfText(row.value), 62) as string[]
      const rowHeight = Math.max(labelLines.length, valueLines.length) * 4.4 + 6
      ensureSpace(rowHeight)
      doc.setFillColor(...COLORS.surface)
      doc.rect(MARGIN, y - 4, CONTENT_WIDTH, rowHeight, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...COLORS.muted)
      doc.text(labelLines, MARGIN + 3, y + 1)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...COLORS.ink)
      doc.text(valueLines, PAGE_WIDTH - MARGIN - 3, y + 1, { align: 'right' })
      doc.setDrawColor(...COLORS.line)
      doc.line(MARGIN, y + rowHeight - 4, PAGE_WIDTH - MARGIN, y + rowHeight - 4)
      y += rowHeight
    })
    y += 5
  }

  const textList = (items: string[]) => {
    items.forEach((item, index) => {
      const lines = doc.splitTextToSize(pdfText(`${index + 1}. ${item}`), CONTENT_WIDTH - 8) as string[]
      const blockHeight = lines.length * 4.5 + 5
      ensureSpace(blockHeight)
      doc.setFillColor(...COLORS.surface)
      doc.roundedRect(MARGIN, y - 4, CONTENT_WIDTH, blockHeight, 1.5, 1.5, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.3)
      doc.setTextColor(...COLORS.muted)
      doc.text(lines, MARGIN + 4, y + 1)
      y += blockHeight + 2
    })
    y += 3
  }

  paintPage(doc)
  doc.setProperties({
    title: `NUMORA - ${calculator.title}`,
    subject: 'NUMORA calculation report',
    author: 'NUMORA',
    creator: 'NUMORA browser PDF export',
  })

  doc.setTextColor(...COLORS.ink)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(21)
  const titleLines = doc.splitTextToSize(pdfText(calculator.title), CONTENT_WIDTH) as string[]
  doc.text(titleLines, MARGIN, 45)
  y = 45 + titleLines.length * 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.muted)
  const descriptionLines = doc.splitTextToSize(pdfText(calculator.description), CONTENT_WIDTH) as string[]
  doc.text(descriptionLines, MARGIN, y)
  y += descriptionLines.length * 4.5 + 7

  const summaryLines = doc.splitTextToSize(pdfText(result.summary), CONTENT_WIDTH - 18) as string[]
  const resultCardHeight = Math.max(45, 30 + summaryLines.length * 4.2)
  ensureSpace(resultCardHeight + 5)
  doc.setFillColor(...COLORS.accent)
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, resultCardHeight, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text(pdfText(result.primary.label.toUpperCase()), MARGIN + 8, y + 11)
  doc.setFontSize(23)
  const primaryLines = doc.splitTextToSize(displayResult(result.primary), CONTENT_WIDTH - 16) as string[]
  doc.text(primaryLines, MARGIN + 8, y + 23)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.text(summaryLines, MARGIN + 8, y + resultCardHeight - summaryLines.length * 4.2 - 4)
  y += resultCardHeight + 12

  sectionHeading('Result breakdown')
  keyValueRows(result.breakdown.map((item) => ({ label: item.label, value: displayResult(item) })))

  if (result.chart?.length) {
    sectionHeading(result.chartTitle ?? 'Result composition')
    keyValueRows(result.chart.map((item) => ({ label: item.label, value: pdfText(item.displayValue ?? formatResult(item.value, 'currency')) })))
  }

  sectionHeading('What this means')
  textList(result.insights)

  const visibleFields = calculator.fields.filter((field) => inputs[field.key] !== undefined)
  sectionHeading('Your inputs')
  keyValueRows(visibleFields.map((field) => ({ label: field.label, value: displayInput(field, inputs) })))

  sectionHeading('Assumptions and limits')
  textList(calculator.assumptions)

  if (calculator.sourceLabel || calculator.sourceUrl) {
    sectionHeading('Source record')
    keyValueRows([
      { label: 'Source', value: calculator.sourceLabel ?? 'Reference source' },
      ...(calculator.sourceUrl ? [{ label: 'Link', value: calculator.sourceUrl }] : []),
    ])
  }

  addFooters(doc, calculator)
  return doc
}

export async function downloadResultPdf(calculator: CalculatorDefinition, inputs: Record<string, number | string>, result: CalculatorResult) {
  const doc = await createResultPdf(calculator, inputs, result)
  doc.save(`numora-${calculator.slug}-result.pdf`)
}
