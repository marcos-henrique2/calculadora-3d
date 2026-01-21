export interface CalculatorInputs {
  // Dados do Cliente
  clientName?: string; // <--- Campo adicionado

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
  /**
   * Custo de embalagem por unidade (R$). Este valor representa os gastos com
   * caixas, sacolas ou material de embalagem adicional para a peça impressa.
   */
  packagingCost: number;

  /**
   * Custos extras diversos (R$). Use este campo para incluir despesas
   * adicionais que não se enquadram nos demais custos, como adesivos,
   * cartões de visita ou pequenos acessórios.
   */
  extraCost: number;
  failureRate: number;
  complexity: 'simple' | 'intermediate' | 'high';
  profitMargin: number;

  // Taxas
  additionalFee: number;

  // Comparação de Preço (opcional)
  desiredPrice?: number;

  /**
   * Indica se o preço final deve ser arredondado para um valor inteiro.
   * Quando verdadeiro, o valor final mostrado será arredondado usando Math.round().
   */
  roundPrice: boolean;

  /**
   * Percentual de desconto para preços de atacado. Representa o abatimento
   * percentual aplicado sobre o preço final de venda ao oferecer um valor
   * reduzido para revendedores ou pedidos em grande quantidade. Por exemplo,
   * um valor de 20 significa que o preço final será reduzido em 20%.
   * Se undefined ou 0, nenhum desconto é aplicado.
   */
  wholesaleDiscount?: number;
}

export interface CalculationResults {
  // Custos detalhados
  filamentCost: number;
  energyCost: number;
  wearCost: number;
  laborCost: number;
  maintenanceTotalCost: number;
  /** Custo de embalagem por unidade */
  packagingCost: number;

  /** Custos extras diversos por unidade */
  extraCost: number;
  failureCost: number;
  complexityMultiplier: number;

  // Totais
  productionCost: number;
  costPerUnit: number;
  profitAmount: number;
  finalPrice: number;
  finalPriceWithFee: number;
  totalTime: number;

  // Novos campos
  /** Lucro líquido por unidade */
  profitPerUnit: number;

  /** Preço final por unidade (com margem e taxa) */
  finalPricePerUnit: number;
}
