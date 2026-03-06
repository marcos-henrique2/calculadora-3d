import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalculatorForm } from "@/components/CalculatorForm";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { QuoteTab, QuoteItem } from "@/components/QuoteTab";
import { CalculationCard } from "@/components/CalculationCard";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { calculateCosts } from "@/utils/calculator";
import { validateCalculatorInputs } from "@/utils/validation";
import { generateQuotePDF } from "@/utils/pdfGenerator";
import { Calculator, FileText, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("activeTab") ?? "calculator";
    return "calculator";
  });
  const [inputs, setInputs] = useState<CalculatorInputs>({
    pieceName: "", quantity: 1, material: "PLA", manualPainting: false,
    filamentPrice: 100, filamentUsed: 0, printTimeHours: 0, printTimeMinutes: 0,
    printerPower: 250, energyRate: 0.75, printerValue: 5000, printerLifespan: 5000,
    hourlyRate: 0, activeWorkTime: 0, finishingCost: 0, maintenanceCost: 1,
    failureRate: 5, complexity: "simple", profitMargin: 30, additionalFee: 0,
    desiredPrice: undefined, roundPrice: false, packagingCost: 0, extraCost: 0,
    wholesaleDiscount: 0, useWholesalePrice: false,
  });
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [cardInputs, setCardInputs] = useState<CalculatorInputs | null>(null);
  const [cardResults, setCardResults] = useState<CalculationResults | null>(null);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  // CORREÇÃO DO BUG: Agora a função recebe os dados exatos digitados instantaneamente
  const handleCalculate = (formData: CalculatorInputs) => {
    const validation = validateCalculatorInputs(formData);
    if (!validation.success) {
      const first = validation.error.errors[0];
      const message = first?.message || 'Entradas inválidas';
      toast({ title: 'Atenção', description: message, variant: 'destructive' });
      return;
    }

    const calculatedResults = calculateCosts(formData);
    setResults(calculatedResults);
    setCardInputs(formData);
    setCardResults(calculatedResults);
    setShowCard(true);
    toast({ title: "Cálculo realizado!", description: "Custos calculados com sucesso." });
    setTimeout(() => {
      const section = document.getElementById("results-section");
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleAddItemToQuote = (updatedInputs: CalculatorInputs, updatedResults: CalculationResults) => {
    setQuoteItems((prev) => [...prev, { inputs: updatedInputs, results: updatedResults }]);
    toast({ title: "Item adicionado!", description: "O item foi incluído no orçamento." });
  };
  const handleRemoveQuoteItem = (index: number) => {
    setQuoteItems((prev) => prev.filter((_, i) => i !== index));
  };
  const handleClearQuoteItems = () => {
    setQuoteItems([]);
    toast({ title: "Orçamento limpo", description: "Todos os itens foram removidos." });
  };
  const handleGenerateQuoteFromCard = (updatedInputs: CalculatorInputs, updatedResults: CalculationResults) => {
    setInputs(updatedInputs);
    setResults(updatedResults);
    setActiveTab("quote");
  };
  const handleGenerateMultiPDF = (items: QuoteItem[]) => {
    generateQuotePDF(items);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-gradient-primary text-primary-foreground shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <Printer className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Calculadora 3D Pro</h1>
          </div>
          <p className="text-center text-sm opacity-90 mt-2">Calcule custos e gere orçamentos profissionais para impressão 3D</p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 h-auto p-1 bg-card shadow-lg">
            <TabsTrigger value="calculator" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground py-3">
              <Calculator className="h-4 w-4 mr-2" /> Calculadora
            </TabsTrigger>
            <TabsTrigger value="quote" className="data-[state=active]:bg-gradient-accent data-[state=active]:text-accent-foreground py-3">
              <FileText className="h-4 w-4 mr-2" /> Orçamento
            </TabsTrigger>
          </TabsList>
          <TabsContent value="calculator" className="space-y-8">
            <CalculatorForm inputs={inputs} setInputs={setInputs} onCalculate={handleCalculate} />
            {showCard && cardInputs && cardResults ? (
              <CalculationCard inputs={cardInputs} results={cardResults} onGenerateQuote={handleGenerateQuoteFromCard} onAddItemToQuote={handleAddItemToQuote} />
            ) : (
              <div id="results-section">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Calculator className="h-6 w-6" /> Resultados do Cálculo
                </h2>
                <ResultsDisplay results={results} inputs={inputs} onNavigateToQuote={() => setActiveTab("quote")} />
              </div>
            )}
          </TabsContent>
          <TabsContent value="quote">
            <QuoteTab items={quoteItems} onRemoveItem={handleRemoveQuoteItem} onClearItems={handleClearQuoteItems} onGeneratePDF={handleGenerateMultiPDF} />
          </TabsContent>
        </Tabs>
      </main>
      <footer className="bg-card border-t mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Calculadora 3D Pro - Ferramenta profissional para cálculo de custos de impressão 3D</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;