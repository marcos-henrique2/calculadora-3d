import { CalculatorInputs, CalculationResults } from "@/types/calculator";

export const calculateCosts = (inputs: CalculatorInputs): CalculationResults => {
  const qty = inputs.quantity > 0 ? inputs.quantity : 1;
  const printTime = inputs.printTimeHours + inputs.printTimeMinutes / 60;

  const filamentCost = (inputs.filamentPrice / 1000) * inputs.filamentUsed;
  const energyConsumption = (inputs.printerPower / 1000) * printTime;
  const energyCost = energyConsumption * inputs.energyRate;

  const wearCost =
    inputs.printerLifespan > 0
      ? (inputs.printerValue / inputs.printerLifespan) * printTime
      : 0;
  const laborCost = inputs.hourlyRate * inputs.activeWorkTime;
  const maintenanceTotalCost = inputs.maintenanceCost * printTime;

  const packagingCost = inputs.packagingCost ?? 0;
  const extraCost = inputs.extraCost ?? 0;

  const complexityMultipliers = {
    simple: 1.0,
    intermediate: 1.15,
    high: 1.35,
  } as const;
  const complexityMultiplier = complexityMultipliers[inputs.complexity];

  const printRelatedCost =
    filamentCost + energyCost + wearCost + maintenanceTotalCost;
  const costWithComplexity =
    printRelatedCost * complexityMultiplier +
    laborCost +
    inputs.finishingCost +
    packagingCost +
    extraCost;

  const failureCost = costWithComplexity * (inputs.failureRate / 100);
  const productionCost = costWithComplexity + failureCost;
  const costPerUnit = productionCost / qty;

  const feeMultiplier = 1 + (inputs.additionalFee || 0) / 100;

  let profitAmount = 0;
  let finalPrice = 0;
  let finalPriceWithFee = 0;

  if (inputs.desiredPrice && inputs.desiredPrice > 0) {
    finalPriceWithFee = inputs.desiredPrice;
    finalPrice = finalPriceWithFee / feeMultiplier;
    profitAmount = finalPrice - productionCost;
  } else {
    profitAmount = productionCost * (inputs.profitMargin / 100);
    finalPrice = productionCost + profitAmount;
    finalPriceWithFee = finalPrice * feeMultiplier;
  }

  const profitPerUnit = profitAmount / qty;
  const finalPricePerUnit = finalPriceWithFee / qty;
  const netMarginPercent =
    finalPriceWithFee > 0 ? (profitAmount / finalPriceWithFee) * 100 : 0;

  const totalTime = printTime + inputs.activeWorkTime;

  const wholesaleDiscount = inputs.wholesaleDiscount ?? 0;
  const wholesalePrice = finalPriceWithFee * (1 - wholesaleDiscount / 100);
  const wholesalePricePerUnit = wholesalePrice / qty;

  return {
    filamentCost,
    energyCost,
    wearCost,
    laborCost,
    maintenanceTotalCost,
    packagingCost,
    extraCost,
    failureCost,
    complexityMultiplier,
    productionCost,
    costPerUnit,
    profitAmount,
    finalPrice,
    finalPriceWithFee,
    totalTime,
    profitPerUnit,
    finalPricePerUnit,
    wholesalePrice,
    wholesalePricePerUnit,
    netMarginPercent,
  };
};

export const formatBRL = (value: number, round = false): string => {
  const v = Number.isFinite(value) ? value : 0;
  if (round) {
    return `R$ ${Math.round(v).toLocaleString("pt-BR")}`;
  }
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatTime = (totalHours: number): string => {
  const h = Math.floor(totalHours);
  const m = Math.round((totalHours - h) * 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
};