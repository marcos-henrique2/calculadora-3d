import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { DesktopLayout } from "@/components/layout/DesktopLayout";
import { CalculatorInputs, CalculationResults, QuoteItem } from "@/types/calculator";
import { useCalculatorStore } from "@/store/calculatorStore";
import { calculateCosts } from "@/utils/calculator";
import { validateInputs } from "@/utils/validation";
import { generateQuotePDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

/* ── Valores padrão ── */
const DEFAULT: CalculatorInputs = {
  clientName:       "",
  pieceName:        "",
  quantity:         1,
  material:         "PLA",
  manualPainting:   false,
  filamentPrice:    100,
  filamentUsed:     0,
  printTimeHours:   0,
  printTimeMinutes: 0,
  printerPower:     250,
  energyRate:       0.75,
  printerValue:     5000,
  printerLifespan:  5000,
  hourlyRate:       0,
  activeWorkTime:   0,
  finishingCost:    0,
  maintenanceCost:  1,
  failureRate:      5,
  complexity:       "simple",
  profitMargin:     30,
  additionalFee:    0,
  desiredPrice:     undefined,
  roundPrice:       false,
  packagingCost:    0,
  extraCost:        0,
  wholesaleDiscount:  0,
  useWholesalePrice:  false,
};

export default function Index() {
  const { toast } = useToast();
  const { addQuoteItem } = useCalculatorStore();

  const [inputs,      setInputs]      = useState<CalculatorInputs>(DEFAULT);
  const [results,     setResults]     = useState<CalculationResults | null>(null);
  const [calcIn,      setCalcIn]      = useState<CalculatorInputs | null>(null);

  /* ── Calcular ── */
  const handleCalculate = (data: CalculatorInputs) => {
    const v = validateInputs(data);
    if (!v.success) {
      toast({ title: "Campo inválido", description: v.error.errors[0]?.message ?? "Verifique os dados.", variant: "destructive" });
      return;
    }
    const r = calculateCosts(data);
    setResults(r);
    setCalcIn(data);
    toast({ title: "Cálculo concluído!", description: `"${data.pieceName}" precificado com sucesso.` });
  };

  /* ── Adicionar ao orçamento ── */
  const handleAdd = (i: CalculatorInputs, r: CalculationResults) => {
    addQuoteItem({ inputs: i, results: r });
    toast({ title: "Item adicionado!", description: `"${i.pieceName}" está no orçamento.` });
  };

  const handleGenerate   = (i: CalculatorInputs, r: CalculationResults) => generateQuotePDF([{ inputs: i, results: r }]);
  const handleMultiPDF   = (items: QuoteItem[]) => generateQuotePDF(items);

  const sharedProps = {
    inputs, setInputs, results, calcIn, handleCalculate, handleAdd, handleGenerate, handleMultiPDF
  };

  return (
    <>
      <MobileLayout {...sharedProps} />
      <DesktopLayout {...sharedProps} />
    </>
  );
}
