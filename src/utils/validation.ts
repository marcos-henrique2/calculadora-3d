import { z } from 'zod';
import type { CalculatorInputs } from '@/types/calculator';

export const calculatorSchema = z.object({
  clientName: z.string().optional(),
  pieceName: z.string().min(1, 'O nome da peça é obrigatório'),
  quantity: z.number().int().min(1, 'A quantidade deve ser pelo menos 1'),
  material: z.string().min(1).optional(),
  manualPainting: z.boolean(),
  filamentPrice: z.number().min(0),
  filamentUsed: z.number().min(0),
  printTimeHours: z.number().min(0),
  printTimeMinutes: z.number().min(0).max(59),
  printerPower: z.number().min(0),
  energyRate: z.number().min(0),
  printerValue: z.number().min(0),
  printerLifespan: z.number().min(0),
  hourlyRate: z.number().min(0),
  activeWorkTime: z.number().min(0),
  finishingCost: z.number().min(0),
  maintenanceCost: z.number().min(0),
  packagingCost: z.number().min(0).optional().nullable(),
  extraCost: z.number().min(0).optional().nullable(),
  failureRate: z.number().min(0).max(100),
  complexity: z.union([z.literal('simple'), z.literal('intermediate'), z.literal('high')]),
  profitMargin: z.number().min(0),
  additionalFee: z.number().min(0),
  desiredPrice: z.number().min(0).optional().nullable(),
  roundPrice: z.boolean(),
  wholesaleDiscount: z.number().min(0).max(100).optional(),
  useWholesalePrice: z.boolean().optional(),
  // allow productImage and other unknown fields for forward compatibility
}).strict()

export const validateCalculatorInputs = (inputs: CalculatorInputs) => {
  return calculatorSchema.safeParse(inputs);
};

export type ValidationResult = ReturnType<typeof validateCalculatorInputs>;
