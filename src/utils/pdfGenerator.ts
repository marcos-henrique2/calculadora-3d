import jsPDF from 'jspdf';
import { CalculatorInputs, CalculationResults } from '@/types/calculator';

export const generateQuotePDF = (
  inputs: CalculatorInputs,
  results: CalculationResults
) => {
  const pdf = new jsPDF();
  
  // Configurações
  const primaryColor: [number, number, number] = [21, 89, 179];
  const accentColor: [number, number, number] = [23, 162, 184];
  const margin = 20;
  let yPosition = margin;

  // Cabeçalho com gradiente simulado
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, 210, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ORÇAMENTO', margin, 20);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Impressão 3D Profissional', margin, 30);

  yPosition = 55;

  // Informações da Peça
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Informações da Peça', margin, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const pieceInfo = [
    `Peça: ${inputs.pieceName}`,
    `Quantidade: ${inputs.quantity} unidade(s)`,
    `Material: ${inputs.material}`,
    `Pintura Manual: ${inputs.manualPainting ? 'Sim' : 'Não'}`,
    `Complexidade: ${inputs.complexity === 'simple' ? 'Simples' : 
                      inputs.complexity === 'intermediate' ? 'Intermediária' : 'Alta'}`,
  ];

  pieceInfo.forEach((info) => {
    pdf.text(info, margin, yPosition);
    yPosition += 7;
  });

  // Custos Detalhados
  yPosition += 10;
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...primaryColor);
  pdf.text('Detalhamento de Custos', margin, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);

  const costs = [
    { label: 'Filamento', value: results.filamentCost },
    { label: 'Energia Elétrica', value: results.energyCost },
    { label: 'Desgaste da Impressora', value: results.wearCost },
    { label: 'Mão de Obra', value: results.laborCost },
    { label: 'Manutenção', value: results.maintenanceTotalCost },
    { label: 'Acabamento', value: inputs.finishingCost },
    { label: 'Margem de Falha', value: results.failureCost },
  ];

  costs.forEach((cost) => {
    pdf.text(`${cost.label}:`, margin, yPosition);
    pdf.text(`R$ ${cost.value.toFixed(2)}`, 130, yPosition);
    yPosition += 7;
  });

  // Linha separadora
  yPosition += 5;
  pdf.setDrawColor(...accentColor);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPosition, 190, yPosition);
  yPosition += 10;

  // Totais
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  
  const totals = [
    { label: 'Custo Total de Produção', value: results.productionCost },
    { label: 'Custo por Unidade', value: results.costPerUnit },
    { label: 'Margem de Lucro', value: results.profitAmount },
  ];

  totals.forEach((total) => {
    pdf.text(`${total.label}:`, margin, yPosition);
    pdf.text(`R$ ${total.value.toFixed(2)}`, 130, yPosition);
    yPosition += 8;
  });

  // Preço Final Destacado
  yPosition += 5;
  pdf.setFillColor(...accentColor);
  pdf.rect(margin - 5, yPosition - 7, 175, 12, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text('PREÇO FINAL:', margin, yPosition);
  pdf.text(`R$ ${results.finalPriceWithFee.toFixed(2)}`, 130, yPosition);

  // Tempo Estimado
  yPosition += 20;
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Tempo Total Estimado: ${results.totalTime.toFixed(1)} horas`, margin, yPosition);
  pdf.text(`(Impressão: ${inputs.printTime}h + Trabalho: ${inputs.activeWorkTime}h)`, margin, yPosition + 7);

  // Rodapé
  yPosition = 270;
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Orçamento válido por 30 dias. Valores sujeitos a alteração.', margin, yPosition);
  pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition + 5);

  // Salvar PDF
  pdf.save(`orcamento-${inputs.pieceName.replace(/\s+/g, '-')}.pdf`);
};
