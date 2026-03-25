import { CalculatorInputs, CalculationResults } from "@/types/calculator";

export const calculateCosts = (inputs: CalculatorInputs): CalculationResults => {
  const qty = inputs.quantity > 0 ? inputs.quantity : 1;
  const printTime = inputs.printTimeHours + inputs.printTimeMinutes / 60;

  const filamentCost = (inputs.filamentPrice / 1000) * inputs.filamentUsed;
  const energyConsumption = (inputs.printerPower / 1000) * printTime;
  const energyCost = energyConsumption * inputs.energyRate;

  const wearCost = inputs.printerLifespan > 0 ? (inputs.printerValue / inputs.printerLifespan) * printTime : 0;
  const laborCost = inputs.hourlyRate * inputs.activeWorkTime;
  const maintenanceTotalCost = inputs.maintenanceCost * printTime;

  const packagingCost = inputs.packagingCost ?? 0;
  const extraCost = inputs.extraCost ?? 0;

  const complexityMultipliers = { simple: 1.0, intermediate: 1.15, high: 1.35 } as const;
  const complexityMultiplier = complexityMultipliers[inputs.complexity];

  const printRelatedCost = filamentCost + energyCost + wearCost + maintenanceTotalCost;
  const costWithComplexity = printRelatedCost * complexityMultiplier + laborCost + inputs.finishingCost + packagingCost + extraCost;
  
  const failureCost = costWithComplexity * (inputs.failureRate / 100);
  const productionCost = costWithComplexity + failureCost;
  const costPerUnit = productionCost / qty;

  // --- INÍCIO DA CORREÇÃO ---
  let profitAmount = 0;
  let finalPrice = 0;
  let finalPriceWithFee = 0;

  const feeMultiplier = 1 + (inputs.additionalFee || 0) / 100;

  // Verifica se o utilizador preencheu um preço que deseja cobrar
  if (inputs.desiredPrice && inputs.desiredPrice > 0) {
    finalPriceWithFee = inputs.desiredPrice;
    // Deduz a taxa adicional (se houver) para encontrar o preço base
    finalPrice = finalPriceWithFee / feeMultiplier;
    // Calcula o lucro real em cima desse preço forçado
    profitAmount = finalPrice - productionCost;
  } else {
    // Se deixou em branco, faz o cálculo normal pela margem de lucro
    profitAmount = productionCost * (inputs.profitMargin / 100);
    finalPrice = productionCost + profitAmount;
    finalPriceWithFee = finalPrice * feeMultiplier;
  }

  const profitPerUnit = profitAmount / qty;
  const finalPricePerUnit = finalPriceWithFee / qty;
  // --- FIM DA CORREÇÃO ---

  const totalTime = printTime + inputs.activeWorkTime;

  const wholesaleDiscount = inputs.wholesaleDiscount ?? 0;
  const wholesalePrice = finalPriceWithFee * (1 - wholesaleDiscount / 100);
  const wholesalePricePerUnit = wholesalePrice / qty;

  return {
    filamentCost, energyCost, wearCost, laborCost, maintenanceTotalCost,
    packagingCost, extraCost, failureCost, complexityMultiplier,
    productionCost, costPerUnit, profitAmount, finalPrice,
    finalPriceWithFee, totalTime, profitPerUnit, finalPricePerUnit,
    wholesalePrice, wholesalePricePerUnit,
  };
};