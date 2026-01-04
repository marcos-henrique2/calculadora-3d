import jsPDF from 'jspdf'
import { CalculatorInputs, CalculationResults } from '@/types/calculator'

/**
 * Gera um orçamento em PDF. Esta versão ajusta a exibição do preço final
 * considerando a opção de arredondamento definida em `inputs.roundPrice`.
 * Quando `roundPrice` é verdadeiro, o valor final é arredondado para o
 * inteiro mais próximo. Caso contrário, mantém duas casas decimais.
 */
export const generateQuotePDF = (
  inputs: CalculatorInputs,
  results: CalculationResults
) => {
  const pdf = new jsPDF()

  // === Configurações de estilo ===
  const primaryColor: [number, number, number] = [21, 89, 179] // azul escuro
  const accentColor: [number, number, number] = [23, 162, 184] // azul claro
  const margin = 20
  let y = margin

  // === Cabeçalho ===
  pdf.setFillColor(...primaryColor)
  pdf.rect(0, 0, 210, 40, 'F')

  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(24)
  pdf.setFont('helvetica', 'bold')
  pdf.text('ORÇAMENTO', margin, 20)

  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'normal')
  pdf.text('MALLKI PRINT', margin, 32)

  // === Informações principais ===
  y = 55
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')

  const today = new Date().toLocaleDateString('pt-BR')

  // Determina o preço final para exibição de acordo com o arredondamento
  const finalPriceValue = inputs.roundPrice
    ? Math.round(results.finalPriceWithFee)
    : results.finalPriceWithFee
  const formatPrice = (value: number) => (inputs.roundPrice ? value.toFixed(0) : value.toFixed(2))

  const infoLines = [
    `Cliente: ${inputs.clientName || 'Cliente'}`,
    `Data: ${today}`,
    `Qtd.: ${inputs.quantity}`,
    `Descrição: ${inputs.pieceName}`,
    `Material: ${inputs.material}`,
    `Peso gasto em filamento: ${inputs.filamentUsed?.toFixed(2) || 0} g`,
    `Tempo estimado: ${results.totalTime?.toFixed(1) || 0} h`,
    `Pintura manual: ${inputs.manualPainting ? 'Sim' : 'Não'}`,
    `Valor: R$ ${formatPrice(finalPriceValue)}`,
  ]

  infoLines.forEach((line) => {
    pdf.text(line, margin, y)
    y += 8
  })

  // === Bloco de preço final ===
  y += 5
  pdf.setFillColor(...accentColor)
  pdf.rect(margin - 5, y - 7, 175, 12, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  pdf.text('PREÇO FINAL:', margin, y)
  pdf.text(`R$ ${formatPrice(finalPriceValue)}`, 130, y)

  // === Rodapé: condições ===
  y += 20
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(11)

  pdf.text('Pagamento: 40% junto ao pedido e 60% na entrega', margin, y)
  y += 7
  pdf.text('Prazo: 7 Dias Úteis', margin, y)

  // === Assinatura ===
  y += 20
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(80, 80, 80)
  pdf.text('_________________________', margin, y)
  pdf.text('Anna Vitória', margin, y + 6)
  pdf.text('Orçamentista', margin, y + 12)

  // === Rodapé final ===
  pdf.setFontSize(9)
  pdf.setTextColor(120, 120, 120)
  pdf.text('Orçamento válido por 30 dias. Valores sujeitos a alteração.', margin, 285)

  // === Nome do arquivo (cliente + peça) ===
  const clientSlug = (inputs.clientName || 'cliente')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
  const pieceSlug = (inputs.pieceName || 'peca')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')

  const fileName = `orcamento-${clientSlug}-${pieceSlug}.pdf`

  // === Salvar PDF ===
  pdf.save(fileName)
}