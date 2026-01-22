import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalculatorForm } from "@/components/CalculatorForm";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { QuoteTab, QuoteItem } from "@/components/QuoteTab";
import { CalculationCard } from "@/components/CalculationCard";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { calculateCosts } from "@/utils/calculator";
import { generateQuotePDF } from "@/utils/pdfGenerator";
import { Calculator, FileText, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  // Aba ativa (calculator/quote)
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("activeTab");
      return stored ?? "calculator";
    }
    return "calculator";
  });
  // Inputs padrão
  const [inputs, setInputs] = useState<CalculatorInputs>({
    // Dados da Peça
    pieceName: "",
    quantity: 1,
    material: "PLA",
    manualPainting: false,
    // Parâmetros da Impressão
    filamentPrice: 100,
    filamentUsed: 0,
    printTimeHours: 0,
    printTimeMinutes: 0,
    printerPower: 250,
    energyRate: 0.75,
    printerValue: 5000,
    printerLifespan: 5000,
    // Trabalho e Estratégia
    hourlyRate: 0,
    activeWorkTime: 0,
    finishingCost: 0,
    maintenanceCost: 1,
    failureRate: 5,
    complexity: "simple",
    profitMargin: 30,
    // Taxas
    additionalFee: 0,
    // Comparação de Preço
    desiredPrice: undefined,
    roundPrice: false,
    // Extras
    packagingCost: 0,
    extraCost: 0,
    // Atacado
    wholesaleDiscount: 0,
    useWholesalePrice: false,
  });
  const [results, setResults] = useState<CalculationResults | null>(null);
  // Card pós cálculo
  const [showCard, setShowCard] = useState(false);
  const [cardInputs, setCardInputs] = useState<CalculatorInputs | null>(null);
  const [cardResults, setCardResults] = useState<CalculationResults | null>(null);
  // Lista do orçamento (multi-itens)
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  // Persistência da aba ativa
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("activeTab", activeTab);
    }
  }, [activeTab]);

  const handleCalculate = () => {
    if (!inputs.pieceName.trim()) {
      toast({ title: "Atenção", description: "Por favor, preencha o nome da peça", variant: "destructive" });
      return;
    }
    if (inputs.quantity < 1) {
      toast({ title: "Atenção", description: "A quantidade deve ser pelo menos 1", variant: "destructive" });
      return;
    }
    const calculatedResults = calculateCosts(inputs);
    setResults(calculatedResults);
    // Mostra o card interativo
    setCardInputs(inputs);
    setCardResults(calculatedResults);
    setShowCard(true);
    toast({ title: "Cálculo realizado!", description: "Custos calculados com sucesso." });
    setTimeout(() => {
      const section = document.getElementById("results-section");
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };
  // Adiciona item ao orçamento
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
  // Gera PDF com a lista de itens
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