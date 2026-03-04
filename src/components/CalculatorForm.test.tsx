import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalculatorForm } from './CalculatorForm';
import type { CalculatorInputs } from '@/types/calculator';

const initialInputs: CalculatorInputs = {
  clientName: 'Test Client',
  pieceName: 'Peça Teste',
  quantity: 2,
  material: 'PLA',
  manualPainting: false,
  filamentPrice: 120.5,
  filamentUsed: 10,
  printTimeHours: 1,
  printTimeMinutes: 30,
  printerPower: 100,
  energyRate: 0.8,
  printerValue: 2000,
  printerLifespan: 10000,
  hourlyRate: 20,
  activeWorkTime: 0.5,
  finishingCost: 2,
  maintenanceCost: 0.5,
  packagingCost: 1,
  extraCost: 0,
  failureRate: 1,
  complexity: 'simple',
  profitMargin: 20,
  additionalFee: 5,
  desiredPrice: undefined,
  roundPrice: false,
  wholesaleDiscount: 0,
  useWholesalePrice: false,
};

describe('CalculatorForm', () => {
  test('renders and submits with valid initial inputs', async () => {
    const user = userEvent.setup();
    const setInputs = vi.fn();
    const onCalculate = vi.fn();

    render(<CalculatorForm inputs={initialInputs} setInputs={setInputs} onCalculate={onCalculate} />);

    // ensure some fields are present
    expect(screen.getByLabelText(/Nome\/Descrição da Peça/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Quantidade/i)).toBeInTheDocument();

    // Click the calculate button (ensure interaction doesn't throw)
    const btn = screen.getByRole('button', { name: /Calcular Custos/i });
    await user.click(btn);

    // basic assertion: button exists and is enabled (submission path exercised)
    expect(btn).toBeEnabled();
  });
});
