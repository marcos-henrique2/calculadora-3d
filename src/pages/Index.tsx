import { useState, useEffect, useRef } from "react";
import { CalculatorForm } from "@/components/CalculatorForm";
import { ResultsPanel } from "@/components/ResultsPanel";
import { QuoteTab, QuoteItem } from "@/components/QuoteTab";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { calculateCosts } from "@/utils/calculator";
import { validateCalculatorInputs } from "@/utils/validation";
import { generateQuotePDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Layers,
  Calculator,
  FileText,
  ChevronRight,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_INPUTS: CalculatorInputs = {
  clientName: "",
  pieceName: "",
  quantity: 1,
  material: "PLA",
  manualPainting: false,
  filamentPrice: 100,
  filamentUsed: 0,
  printTimeHours: 0,
  printTimeMinutes: 0,
  printerPower: 250,
  energyRate: 0.75,
  printerValue: 5000,
  printerLifespan: 5000,
  hourlyRate: 0,
  activeWorkTime: 0,
  finishingCost: 0,
  maintenanceCost: 1,
  failureRate: 5,
  complexity: "simple",
  profitMargin: 30,
  additionalFee: 0,
  desiredPrice: undefined,
  roundPrice: false,
  packagingCost: 0,
  extraCost: 0,
  wholesaleDiscount: 0,
  useWholesalePrice: false,
};

type ActiveTab = "calculator" | "quote";

export default function Index() {
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    try {
      return (localStorage.getItem("activeTab") as ActiveTab) ?? "calculator";
    } catch {
      return "calculator";
    }
  });

  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [calcInputs, setCalcInputs] = useState<CalculatorInputs | null>(null);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [isCalculated, setIsCalculated] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("activeTab", activeTab);
    } catch {}
  }, [activeTab]);

  const handleCalculate = (formData: CalculatorInputs) => {
    const validation = validateCalculatorInputs(formData);
    if (!validation.success) {
      const message = validation.error.errors[0]?.message || "Dados inválidos";
      toast({ title: "Atenção", description: message, variant: "destructive" });
      return;
    }
    const calculated = calculateCosts(formData);
    setResults(calculated);
    setCalcInputs(formData);
    setIsCalculated(true);

    setTimeout(() => {
      resultsRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

  const handleAddItemToQuote = (
    updatedInputs: CalculatorInputs,
    updatedResults: CalculationResults
  ) => {
    setQuoteItems((prev) => [...prev, { inputs: updatedInputs, results: updatedResults }]);
    toast({
      title: "Item adicionado!",
      description: `"${updatedInputs.pieceName}" foi incluído no orçamento.`,
    });
  };

  const handleGenerateFromPanel = (
    updatedInputs: CalculatorInputs,
    updatedResults: CalculationResults
  ) => {
    const itemList: QuoteItem[] = [{ inputs: updatedInputs, results: updatedResults }];
    generateQuotePDF(itemList);
  };

  const handleGenerateMultiPDF = (items: QuoteItem[]) => {
    generateQuotePDF(items);
  };

  const handleRemoveQuoteItem = (index: number) => {
    setQuoteItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearQuoteItems = () => {
    setQuoteItems([]);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* ── HEADER ── */}
      <header className="shrink-0 bg-primary h-16 flex items-center px-6 justify-between shadow-md shadow-primary/20 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
            <Printer className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-base leading-none">
              Calculadora 3D Pro
            </h1>
            <p className="text-white/60 text-xs mt-0.5">
              Precificação profissional para impressão 3D
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="border-white/20 text-white/70 text-xs bg-white/10 hidden sm:flex"
          >
            <Layers className="w-3 h-3 mr-1.5" />
            v2.0
          </Badge>
        </div>
      </header>

      {/* ── TABS ── */}
      <nav className="shrink-0 bg-card border-b border-border flex items-stretch px-2 h-12 z-40">
        {(
          [
            {
              id: "calculator" as const,
              label: "Calculadora",
              icon: <Calculator className="w-3.5 h-3.5" />,
              badge: null,
            },
            {
              id: "quote" as const,
              label: "Orçamento",
              icon: <FileText className="w-3.5 h-3.5" />,
              badge: quoteItems.length > 0 ? quoteItems.length : null,
            },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 text-sm font-medium transition-all border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== null && (
              <span className="bg-primary text-primary-foreground text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Calculator Tab */}
        {activeTab === "calculator" && (
          <>
            {/* LEFT: Form */}
            <div className="w-[340px] shrink-0 border-r border-border bg-card overflow-hidden flex flex-col">
              <ScrollArea className="flex-1">
                <div className="p-5">
                  <CalculatorForm
                    inputs={inputs}
                    setInputs={setInputs}
                    onCalculate={handleCalculate}
                  />
                </div>
              </ScrollArea>
            </div>

            {/* RIGHT: Results */}
            <div className="flex-1 overflow-hidden bg-background flex flex-col">
              {!isCalculated ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-8 space-y-5">
                  <div className="w-20 h-20 rounded-3xl bg-primary/8 border border-primary/15 flex items-center justify-center">
                    <Calculator className="w-9 h-9 text-primary/60" />
                  </div>
                  <div className="max-w-xs">
                    <h2 className="text-base font-medium text-foreground">
                      Pronto para calcular
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1.5 text-balance">
                      Preencha os dados à esquerda e clique em{" "}
                      <strong className="text-foreground">Calcular custos</strong>{" "}
                      para ver a análise completa.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-medium flex items-center justify-center">
                        1
                      </span>
                      Preencha os campos
                    </span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-medium flex items-center justify-center">
                        2
                      </span>
                      Calcule
                    </span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-medium flex items-center justify-center">
                        3
                      </span>
                      Gere o PDF
                    </span>
                  </div>
                </div>
              ) : (
                <ScrollArea className="flex-1" ref={resultsRef as any}>
                  <div className="p-5 max-w-2xl">
                    {calcInputs && results && (
                      <ResultsPanel
                        inputs={calcInputs}
                        results={results}
                        onGenerateQuote={handleGenerateFromPanel}
                        onAddItemToQuote={handleAddItemToQuote}
                      />
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          </>
        )}

        {/* Quote Tab */}
        {activeTab === "quote" && (
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 max-w-4xl mx-auto">
                <QuoteTab
                  items={quoteItems}
                  onRemoveItem={handleRemoveQuoteItem}
                  onClearItems={handleClearQuoteItems}
                  onGeneratePDF={handleGenerateMultiPDF}
                />
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}