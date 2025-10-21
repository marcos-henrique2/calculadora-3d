export interface CalculatorInputs {
  // Dados da Peça
  pieceName: string;
  quantity: number;
  material: string;
  manualPainting: boolean;

  // Parâmetros da Impressão
  filamentPrice: number;
  filamentUsed: number;
  printTimeHours: number;
  printTimeMinutes: number;
  printerPower: number;
  energyRate: number;
  printerValue: number;
  printerLifespan: number;

  // Trabalho e Estratégia
  hourlyRate: number;
  activeWorkTime: number;
  finishingCost: number;
  maintenanceCost: number;
  failureRate: number;
  complexity: 'simple' | 'intermediate' | 'high';
  profitMargin: number;

  // Taxas
  additionalFee: number;
}

export interface CalculationResults {
  // Custos detalhados
  filamentCost: number;
  energyCost: number;
  wearCost: number;
  laborCost: number;
  maintenanceTotalCost: number;
  failureCost: number;
  complexityMultiplier: number;
  
  // Totais
  productionCost: number;
  costPerUnit: number;
  profitAmount: number;
  finalPrice: number;
  finalPriceWithFee: number;
  totalTime: number;
}
