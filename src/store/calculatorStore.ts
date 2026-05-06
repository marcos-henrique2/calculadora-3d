import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CalculatorInputs, CalculationResults, QuoteItem } from '@/types/calculator';

interface CalculatorState {
  quoteItems: QuoteItem[];
  addQuoteItem: (item: QuoteItem) => void;
  removeQuoteItem: (index: number) => void;
  clearQuoteItems: () => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set) => ({
      quoteItems: [],
      addQuoteItem: (item) => set((state) => ({ quoteItems: [...state.quoteItems, item] })),
      removeQuoteItem: (index) => set((state) => ({ quoteItems: state.quoteItems.filter((_, i) => i !== index) })),
      clearQuoteItems: () => set({ quoteItems: [] }),
    }),
    {
      name: 'calculator-storage',
    }
  )
);
