import type { CalculatorDefinition, CalculatorResult } from '../types/calculator'
import { formatResult, getCurrencySymbol } from './formatters'

const pdfText = (value: string) => value.replaceAll('₹', 'INR ').replaceAll('€', 'EUR ').replaceAll('£', 'GBP ').replaceAll('–', '-').replaceAll('·', '/')

export async function downloadResultPdf(calculator: CalculatorDefinition, inputs: Record<string, number | string>, result: CalculatorResult) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = 210

  doc.setFillColor(242, 239, 231)
  doc.rect(0, 0, pageWidth, 297, 'F')
  doc.setFillColor(22, 63, 58)
  doc.rect(0, 0, pageWidth, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.text('NUMORA', 16, 18)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('DECISION NOTE / GENERATED IN YOUR BROWSER', 194, 18, { align: 'right' })

  doc.setTextColor(31, 36, 34)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(pdfText(calculator.title), 16, 46)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(95, 99, 94)
  const description = doc.splitTextToSize(pdfText(calculator.description), 170)
  doc.text(description, 16, 54)

  doc.setFillColor(255, 92, 53)
  doc.roundedRect(16, 69, 178, 45, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(pdfText(result.primary.label.toUpperCase()), 25, 83)
  doc.setFontSize(25)
  doc.text(pdfText(result.primary.displayValue ?? formatResult(result.primary.value, result.primary.kind)), 25, 101)

  let y = 130
  doc.setTextColor(31, 36, 34)
  doc.setFontSize(9)
  doc.text('RESULT BREAKDOWN', 16, y)
  y += 8
  result.breakdown.forEach((item, index) => {
    doc.setDrawColor(205, 201, 190)
    doc.line(16, y + 6, 194, y + 6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(95, 99, 94)
    doc.text(pdfText(item.label), 17, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(31, 36, 34)
    doc.text(pdfText(item.displayValue ?? formatResult(item.value, item.kind)), 193, y, { align: 'right' })
    y += index === result.breakdown.length - 1 ? 15 : 12
  })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('YOUR INPUTS', 16, y)
  y += 8
  calculator.fields.filter((field) => inputs[field.key] !== undefined).forEach((field) => {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(95, 99, 94)
    doc.text(pdfText(field.label), 17, y)
    doc.setTextColor(31, 36, 34)
    const rawValue = inputs[field.key]
    const selectedOption = field.options?.find((option) => option.value === rawValue)
    const value = field.type === 'checkbox'
      ? (rawValue === 1 ? 'Yes' : 'No')
      : field.type === 'text'
        ? String(rawValue)
      : field.type === 'select'
        ? (selectedOption?.label ?? String(rawValue))
        : `${field.currencyField ? getCurrencySymbol(Number(inputs[field.currencyField])) : (field.prefix ?? '')}${typeof rawValue === 'number' ? rawValue.toLocaleString('en-IN') : rawValue}${field.suffix ? ` ${field.suffix}` : ''}`
    doc.text(pdfText(value), 193, y, { align: 'right' })
    y += 7
  })

  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('ASSUMPTIONS & LIMITS', 16, y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(95, 99, 94)
  calculator.assumptions.forEach((assumption) => {
    const lines = doc.splitTextToSize(pdfText(`- ${assumption}`), 175)
    doc.text(lines, 17, y)
    y += lines.length * 5 + 2
  })

  doc.setDrawColor(22, 63, 58)
  doc.line(16, 278, 194, 278)
  doc.setFontSize(8)
  doc.text(`Reviewed ${calculator.reviewed} / Estimate only, not financial advice.`, 16, 285)
  doc.text('numora / money, made clear', 194, 285, { align: 'right' })
  doc.save(`numora-${calculator.slug}-result.pdf`)
}
