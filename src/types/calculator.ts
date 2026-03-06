export interface CalculatorInputs {
  clientName?: string;
  pieceName: string;
  quantity: number;
  material: string;
  manualPainting: boolean;

  filamentPrice: number;
  filamentUsed: number;
  printTimeHours: number;
  printTimeMinutes: number;
  printerPower: number;
  energyRate: number;
  printerValue: number;
  printerLifespan: number;

  hourlyRate: number;
  activeWorkTime: number;
  finishingCost: number;
  maintenanceCost: number;
  packagingCost: number;
  extraCost: number;
  failureRate: number;
  complexity: 'simple' | 'intermediate' | 'high';
  profitMargin: number;

  additionalFee: number;
  desiredPrice?: number;
  roundPrice: boolean;
  wholesaleDiscount?: number;
  useWholesalePrice?: boolean;
}

export interface CalculationResults {
  filamentCost: number;
  energyCost: number;
  wearCost: number;
  laborCost: number;
  maintenanceTotalCost: number;
  packagingCost: number;
  extraCost: number;
  failureCost: number;
  complexityMultiplier: number;

  productionCost: number;
  costPerUnit: number;
  profitAmount: number;
  finalPrice: number;
  finalPriceWithFee: number;
  totalTime: number;
  profitPerUnit: number;
  finalPricePerUnit: number;
  wholesalePrice: number;
  wholesalePricePerUnit: number;
}