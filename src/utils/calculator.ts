import { CalculatorInputs, CalculationResults } from "@/types/calculator";

/**
 * Calcula os custos de produção e preços de venda de uma peça impressa,
 * incluindo custos de embalagem e extras. O cálculo considera custos
 * diretos (filamento, energia elétrica, desgaste da impressora, mão‑de‑obra,
 * manutenção), aplica multiplicadores de complexidade, taxa de falha,
 * margem de lucro, taxas adicionais e soma custos fixos (embalagem e extras).
 */
export const calculateCosts = (inputs: CalculatorInputs): CalculationResults => {
  // Converter tempo total de impressão para horas decimais
  const printTime = inputs.printTimeHours + inputs.printTimeMinutes / 60;

  // Custo do filamento (preço por kg → preço por g × gramas utilizadas)
  const filamentCost = (inputs.filamentPrice / 1000) * inputs.filamentUsed;

  // Custo de energia (potência em W → kW × horas × tarifa)
  const energyConsumption = (inputs.printerPower / 1000) * printTime;
  const energyCost = energyConsumption * inputs.energyRate;

  // Custo de desgaste da impressora (valor da impressora dividido pela vida útil).
  let wearCost = 0;
  if (inputs.printerLifespan && inputs.printerLifespan > 0) {
    wearCost = (inputs.printerValue / inputs.printerLifespan) * printTime;
  } else {
    wearCost = 0;
  }

  // Custo de mão‑de‑obra (valor por hora × horas de trabalho ativo)
  const laborCost = inputs.hourlyRate * inputs.activeWorkTime;

  // Custo de manutenção (custo por hora × horas de impressão)
  const maintenanceTotalCost = inputs.maintenanceCost * printTime;

  // Custo de embalagem e custos extras (custos fixos por unidade)
  // Se o usuário não informar, tratamos como 0 para não influenciar o cálculo.
  const packagingCost = inputs.packagingCost ?? 0;
  const extraCost = inputs.extraCost ?? 0;

  // Multiplicador de complexidade
  const complexityMultipliers = {
    simple: 1.0,
    intermediate: 1.15,
    high: 1.35,
  } as const;
  const complexityMultiplier = complexityMultipliers[inputs.complexity];

  // Cálculo do custo com complexidade:
  // aplicamos o multiplicador apenas aos custos relacionados à impressão
  // (filamento, energia, desgaste e manutenção). Somamos custos de mão‑de‑obra,
  // acabamento, embalagem e extras fora do multiplicador.
  const printRelatedCost = filamentCost + energyCost + wearCost + maintenanceTotalCost;
  const costWithComplexity =
    printRelatedCost * complexityMultiplier +
    laborCost +
    inputs.finishingCost +
    // Incluímos custos fixos (embalagem e extras) fora do multiplicador
    packagingCost +
    extraCost;

  // Custo de falha (% sobre o custo ajustado)
  const failureCost = costWithComplexity * (inputs.failureRate / 100);

  // Custo total de produção
  const productionCost = costWithComplexity + failureCost;

  // Custo por unidade (divide pelo número de unidades, garantindo ao menos 1)
  const quantity = inputs.quantity > 0 ? inputs.quantity : 1;
  const costPerUnit = productionCost / quantity;

  // Margem de lucro total (valor absoluto)
  const profitAmount = productionCost * (inputs.profitMargin / 100);
  // Lucro por unidade
  const profitPerUnit = profitAmount / quantity;

  // Preço final sem taxa de marketplace
  const finalPrice = productionCost + profitAmount;

  // Preço final com taxa adicional de marketplace (caso exista)
  const finalPriceWithFee = finalPrice * (1 + inputs.additionalFee / 100);
  // Preço final por unidade (incluindo margem e taxa)
  const finalPricePerUnit = finalPriceWithFee / quantity;

  // Tempo total (impressão + trabalho ativo)
  const totalTime = printTime + inputs.activeWorkTime;

  return {
    filamentCost,
    energyCost,
    wearCost,
    laborCost,
    maintenanceTotalCost,
    failureCost,
    complexityMultiplier,
    packagingCost,
    extraCost,
    productionCost,
    costPerUnit,
    profitAmount,
    finalPrice,
    finalPriceWithFee,
    totalTime,
    profitPerUnit,
    finalPricePerUnit,
  };
};