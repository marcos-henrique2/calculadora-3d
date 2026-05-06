import { useState } from "react";
import { CalculatorForm } from "@/components/CalculatorForm";
import { ResultsPanel } from "@/components/ResultsPanel";
import { QuoteTab } from "@/components/QuoteTab";
import { CalculatorInputs, CalculationResults, QuoteItem } from "@/types/calculator";
import { useCalculatorStore } from "@/store/calculatorStore";
import { cn } from "@/lib/utils";
import { Calculator, FileText, Printer, ChevronRight } from "lucide-react";

type DesktopTab = "calculator" | "quote";

interface Props {
  inputs: CalculatorInputs;
  setInputs: (v: CalculatorInputs) => void;
  results: CalculationResults | null;
  calcIn: CalculatorInputs | null;
  handleCalculate: (data: CalculatorInputs) => void;
  handleAdd: (i: CalculatorInputs, r: CalculationResults) => void;
  handleGenerate: (i: CalculatorInputs, r: CalculationResults) => void;
  handleMultiPDF: (items: QuoteItem[]) => void;
}

export const DesktopLayout = ({
  inputs, setInputs, results, calcIn, handleCalculate, handleAdd, handleGenerate, handleMultiPDF
}: Props) => {
  const [desktopTab, setDesktopTab] = useState<DesktopTab>("calculator");
  const { quoteItems } = useCalculatorStore();

  return (
    <div className="hidden md:flex flex-col bg-background" style={{ height: "100vh", overflow: "hidden" }}>
      {/* HEADER desktop */}
      <header
        className="shrink-0 flex items-center justify-between px-7 h-16 bg-primary text-primary-foreground z-50 shadow-md relative"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shadow-sm backdrop-blur-sm">
            <Printer size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-[17px] leading-none">Calculadora 3D Pro</h1>
            <p className="text-white/70 text-[13px] mt-0.5">Precificação profissional para impressão 3D</p>
          </div>
        </div>
      </header>

      {/* TABS desktop */}
      <nav className="shrink-0 flex items-stretch px-4 bg-white/80 backdrop-blur-md border-b border-border h-12 z-40 relative">
        {([
          { id: "calculator" as DesktopTab, label: "Calculadora", icon: <Calculator size={15} /> },
          { id: "quote"      as DesktopTab, label: "Orçamento",   icon: <FileText   size={15} />, badge: quoteItems.length || null },
        ] as const).map(({ id, label, icon, badge }) => (
          <button
            key={id}
            onClick={() => setDesktopTab(id)}
            className={cn(
              "flex items-center gap-2 px-5 text-[14px] font-medium border-b-2 transition-all",
              desktopTab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            {icon}
            {label}
            {badge ? (
              <span className="bg-primary text-white text-[11px] font-semibold rounded-full w-5 h-5 flex items-center justify-center animate-in zoom-in">{badge}</span>
            ) : null}
          </button>
        ))}
      </nav>

      {/* CONTEÚDO desktop */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* ABA CALCULADORA */}
        {desktopTab === "calculator" && (
          <div className="flex w-full h-full animate-in fade-in duration-300">
            {/* Coluna formulário */}
            <div className="bg-white border-r border-border flex flex-col overflow-hidden w-[55%] min-w-[520px]">
              <div className="shrink-0 px-8 py-4 border-b border-border bg-white">
                <h2 className="text-[15px] font-semibold text-foreground">Dados para cálculo</h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">Preencha todas as seções e clique em <strong>Calcular custos</strong></p>
              </div>
              <div className="flex-1 overflow-y-auto px-8 py-7">
                <CalculatorForm inputs={inputs} setInputs={setInputs} onCalculate={handleCalculate} />
              </div>
            </div>

            {/* Coluna resultados */}
            <div className="flex-1 flex flex-col overflow-hidden bg-background">
              <div className="shrink-0 px-7 py-4 border-b border-border bg-white">
                <h2 className="text-[15px] font-semibold text-foreground">Resultado</h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">Análise de custos, margem e ROI</p>
              </div>
              {!results || !calcIn ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-8 space-y-5">
                  <div className="w-20 h-20 rounded-3xl bg-primary/8 border border-primary/15 flex items-center justify-center">
                    <Calculator size={34} className="text-primary/50" />
                  </div>
                  <div className="max-w-[260px]">
                    <p className="text-[15px] font-semibold text-foreground">Pronto para calcular</p>
                    <p className="text-[13px] text-muted-foreground mt-1.5">
                      Preencha o formulário ao lado e clique em{" "}
                      <strong className="text-foreground">Calcular custos</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    <span>Preencha</span><ChevronRight size={12} /><span>Calcule</span><ChevronRight size={12} /><span>Gere o PDF</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-7 py-6">
                  <ResultsPanel inputs={calcIn} results={results} onGenerateQuote={handleGenerate} onAddToQuote={(i, r) => { handleAdd(i, r); setDesktopTab("quote"); }} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA ORÇAMENTO */}
        {desktopTab === "quote" && (
          <div className="flex-1 overflow-y-auto w-full h-full bg-background animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="max-w-5xl mx-auto px-8 py-8">
              <QuoteTab onGeneratePDF={handleMultiPDF} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
