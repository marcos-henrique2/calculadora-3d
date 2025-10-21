import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalculatorForm } from "@/components/CalculatorForm";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { QuoteTab } from "@/components/QuoteTab";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { calculateCosts } from "@/utils/calculator";
import { Calculator, FileText, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [inputs, setInputs] = useState<CalculatorInputs>({
    // Dados da Peça
    pieceName: "",
    quantity: 1,
    material: "PLA",
    manualPainting: false,

    // Parâmetros da Impressão
    filamentPrice: 80,
    filamentUsed: 50,
    printTimeHours: 3,
    printTimeMinutes: 0,
    printerPower: 250,
    energyRate: 0.75,
    printerValue: 3000,
    printerLifespan: 5000,

    // Trabalho e Estratégia
    hourlyRate: 50,
    activeWorkTime: 0.5,
    finishingCost: 0,
    maintenanceCost: 2,
    failureRate: 5,
    complexity: 'simple',
    profitMargin: 30,

    // Taxas
    additionalFee: 0,
  });

  const [results, setResults] = useState<CalculationResults | null>(null);

  const handleCalculate = () => {
    if (!inputs.pieceName.trim()) {
      toast({
        title: "Atenção",
        description: "Por favor, preencha o nome da peça",
        variant: "destructive",
      });
      return;
    }

    if (inputs.quantity < 1) {
      toast({
        title: "Atenção",
        description: "A quantidade deve ser pelo menos 1",
        variant: "destructive",
      });
      return;
    }

    const calculatedResults = calculateCosts(inputs);
    setResults(calculatedResults);

    toast({
      title: "Cálculo realizado!",
      description: "Custos calculados com sucesso. Confira os resultados abaixo.",
    });

    // Scroll suave até os resultados
    setTimeout(() => {
      const resultsSection = document.getElementById('results-section');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <Printer className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Calculadora 3D Pro</h1>
          </div>
          <p className="text-center text-sm opacity-90 mt-2">
            Calcule custos e gere orçamentos profissionais para impressão 3D
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 h-auto p-1 bg-card shadow-lg">
            <TabsTrigger 
              value="calculator" 
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground py-3"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculadora
            </TabsTrigger>
            <TabsTrigger 
              value="quote"
              className="data-[state=active]:bg-gradient-accent data-[state=active]:text-accent-foreground py-3"
            >
              <FileText className="h-4 w-4 mr-2" />
              Orçamento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-8">
            <CalculatorForm 
              inputs={inputs} 
              setInputs={setInputs} 
              onCalculate={handleCalculate}
            />
            
            <div id="results-section">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Calculator className="h-6 w-6" />
                Resultados do Cálculo
              </h2>
              <ResultsDisplay results={results} inputs={inputs} />
            </div>
          </TabsContent>

          <TabsContent value="quote">
            <QuoteTab results={results} inputs={inputs} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Calculadora 3D Pro - Ferramenta profissional para cálculo de custos de impressão 3D</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
