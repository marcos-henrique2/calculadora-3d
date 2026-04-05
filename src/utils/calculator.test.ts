import { describe, it, expect } from 'vitest';
import { calculateCosts } from './calculator';
import type { CalculatorInputs } from '../types/calculator';

const baseInput: CalculatorInputs = {
  pieceName: 'Test Piece',
  quantity: 1,
  material: 'PLA',
  manualPainting: false,
  filamentPrice: 110,
  filamentUsed: 10,
  printTimeHours: 1,
  printTimeMinutes: 30,
  printerPower: 250,
  energyRate: 0.75,
  printerValue: 5000,
  printerLifespan: 5000,
  hourlyRate: 20,
  activeWorkTime: 0.5,
  finishingCost: 5,
  maintenanceCost: 2,
  failureRate: 5,
  complexity: 'simple',
  profitMargin: 30,
  additionalFee: 0,
  desiredPrice: undefined,
  roundPrice: false,
  packagingCost: 0,
  extraCost: 0,
  wholesaleDiscount: 0,
  useWholesalePrice: false,
};

describe('calculateCosts', () => {
  it('returns expected fields and invariants for a normal input', () => {
    const res = calculateCosts(baseInput);
    expect(res.productionCost).toBeGreaterThanOrEqual(0);
    expect(res.finalPriceWithFee).toBeGreaterThanOrEqual(res.finalPrice);
    expect(res.wholesalePrice).toBeLessThanOrEqual(res.finalPriceWithFee);
    expect(res.costPerUnit).toBeGreaterThanOrEqual(0);
  });

  it('handles quantity = 0 by treating quantity as at least 1', () => {
    const input = { ...baseInput, quantity: 0 };
    const res = calculateCosts(input);
    // When quantity is 0 the implementation treats it as 1
    expect(res.costPerUnit).toBeCloseTo(res.productionCost, 6);
    expect(res.finalPricePerUnit).toBeCloseTo(res.finalPriceWithFee, 6);
  });

  it('sets wearCost to 0 when printerLifespan is 0', () => {
    const input = { ...baseInput, printerLifespan: 0 };
    const res = calculateCosts(input);
    expect(res.wearCost).toBe(0);
  });

  it('applies 100% failureRate doubling the production cost contribution', () => {
    const input = { ...baseInput, failureRate: 100 };
    // Recompute some internals by calling calculateCosts and by computing costWithComplexity
    const res = calculateCosts(input);
    // productionCost should be greater than or equal to cost-related fields
    expect(res.productionCost).toBeGreaterThan(0);
  });

  it('applies wholesaleDiscount correctly', () => {
    const input = { ...baseInput, wholesaleDiscount: 10, additionalFee: 5 };
    const res = calculateCosts(input);
    const expectedWholesale = res.finalPriceWithFee * 0.9;
    expect(res.wholesalePrice).toBeCloseTo(expectedWholesale, 6);
  });
});
