import { CalculatorInputs, CalculationResults } from "@/types/calculator";

export const calculateCosts = (inputs: CalculatorInputs): CalculationResults => {
  // Custo do filamento
  const filamentCost = (inputs.filamentPrice / 1000) * inputs.filamentUsed;

  // Custo de energia
  const energyConsumption = (inputs.printerPower / 1000) * inputs.printTime;
  const energyCost = energyConsumption * inputs.energyRate;

  // Custo de desgaste da impressora
  const wearCost = (inputs.printerValue / inputs.printerLifespan) * inputs.printTime;

  // Custo de mão de obra
  const laborCost = inputs.hourlyRate * inputs.activeWorkTime;

  // Custo de manutenção
  const maintenanceTotalCost = inputs.maintenanceCost * inputs.printTime;

  // Multiplicador de complexidade
  const complexityMultipliers = {
    simple: 1.0,
    intermediate: 1.15,
    high: 1.35
  };
  const complexityMultiplier = complexityMultipliers[inputs.complexity];

  // Custo base de produção
  const baseCost = filamentCost + energyCost + wearCost + laborCost + 
                   maintenanceTotalCost + inputs.finishingCost;

  // Aplicar complexidade
  const costWithComplexity = baseCost * complexityMultiplier;

  // Custo de falha
  const failureCost = costWithComplexity * (inputs.failureRate / 100);

  // Custo total de produção
  const productionCost = costWithComplexity + failureCost;

  // Custo por unidade
  const costPerUnit = productionCost / inputs.quantity;

  // Aplicar margem de lucro
  const profitAmount = productionCost * (inputs.profitMargin / 100);
  const finalPrice = productionCost + profitAmount;

  // Aplicar taxa adicional
  const finalPriceWithFee = finalPrice * (1 + inputs.additionalFee / 100);

  // Tempo total
  const totalTime = inputs.printTime + inputs.activeWorkTime;

  return {
    filamentCost,
    energyCost,
    wearCost,
    laborCost,
    maintenanceTotalCost,
    failureCost,
    complexityMultiplier,
    productionCost,
    costPerUnit,
    profitAmount,
    finalPrice,
    finalPriceWithFee,
    totalTime
  };
};
