import { useState } from "react";
import { CalculatorForm } from "@/components/CalculatorForm";
import { ResultsPanel } from "@/components/ResultsPanel";
import { QuoteTab } from "@/components/QuoteTab";
import { CalculatorInputs, CalculationResults, QuoteItem } from "@/types/calculator";
import { useCalculatorStore } from "@/store/calculatorStore";
import { cn } from "@/lib/utils";
import { Calculator, FileText, Printer, BarChart2 } from "lucide-react";

type MobileTab = "form" | "results" | "quote";

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

export const MobileLayout = ({
  inputs, setInputs, results, calcIn, handleCalculate, handleAdd, handleGenerate, handleMultiPDF
}: Props) => {
  const [mobileTab, setMobileTab] = useState<MobileTab>("form");
  const { quoteItems } = useCalculatorStore();

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background md:hidden">
      {/* HEADER mobile */}
      <header className="shrink-0 flex items-center gap-3 px-4 bg-primary text-primary-foreground h-14 sticky top-0 z-50 shadow-md">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0 shadow-sm backdrop-blur-sm">
          <Printer size={16} className="text-white" />
        </div>
        <h1 className="font-semibold text-[16px] flex-1 truncate">Calculadora 3D Pro</h1>
        {quoteItems.length > 0 && (
          <button onClick={() => setMobileTab("quote")} className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-1.5 transition-all active:scale-95 shadow-sm">
            <FileText size={15} className="text-white" />
            <span className="text-white text-[13px] font-bold">{quoteItems.length}</span>
          </button>
        )}
      </header>

      {/* NAV mobile */}
      <nav className="shrink-0 flex bg-white/80 backdrop-blur-md border-b border-border sticky top-14 z-40">
        {([
          { id: "form"    as MobileTab, label: "Formulário", icon: <Calculator size={16} /> },
          { id: "results" as MobileTab, label: "Resultado",  icon: <BarChart2  size={16} />, locked: !results },
          { id: "quote"   as MobileTab, label: "Orçamento",  icon: <FileText   size={16} />, badge: quoteItems.length || null },
        ] as const).map(({ id, label, icon, locked, badge }) => (
          <button
            key={id}
            onClick={() => {
              if (!locked) setMobileTab(id);
            }}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 py-2.5 border-b-2 transition-all text-[11px] font-medium",
              mobileTab === id   ? "border-primary text-primary"
              : locked           ? "border-transparent text-muted-foreground/35 cursor-default"
              :                    "border-transparent text-muted-foreground active:bg-secondary/50"
            )}
          >
            <div className="relative">
              {icon}
              {badge ? (
                <span className="absolute -top-1.5 -right-2.5 bg-primary text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-in zoom-in">
                  {badge}
                </span>
              ) : null}
            </div>
            {label}
          </button>
        ))}
      </nav>

      {/* CONTEÚDO mobile */}
      <div className="flex-1">
        {/* ABA: FORMULÁRIO */}
        {mobileTab === "form" && (
          <div className="bg-white min-h-full animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="px-4 py-3 border-b border-border bg-white">
              <h2 className="text-[14px] font-semibold text-foreground">Dados para cálculo</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Preencha e clique em <strong>Calcular custos</strong>
              </p>
            </div>
            <div className="px-4 py-4 pb-12">
              <CalculatorForm inputs={inputs} setInputs={setInputs} onCalculate={(data) => { handleCalculate(data); setMobileTab("results"); }} />
            </div>
          </div>
        )}

        {/* ABA: RESULTADO */}
        {mobileTab === "results" && (
          <div className="min-h-full animate-in fade-in slide-in-from-right-4 duration-300">
            {!results || !calcIn ? (
              <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-6 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-primary/8 border border-primary/15 flex items-center justify-center">
                  <Calculator size={28} className="text-primary/50" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-foreground">Ainda sem resultado</p>
                  <p className="text-[13px] text-muted-foreground mt-1.5">
                    Vá para <strong>Formulário</strong> e clique em <strong>Calcular custos</strong>
                  </p>
                </div>
                <button
                  onClick={() => setMobileTab("form")}
                  className="h-11 px-6 rounded-xl bg-primary text-white text-[14px] font-medium flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95"
                >
                  <Calculator size={16} /> Ir para Formulário
                </button>
              </div>
            ) : (
              <div className="px-4 py-4 pb-12">
                <ResultsPanel inputs={calcIn} results={results} onGenerateQuote={handleGenerate} onAddToQuote={(i, r) => { handleAdd(i, r); setMobileTab("quote"); }} />
              </div>
            )}
          </div>
        )}

        {/* ABA: ORÇAMENTO */}
        {mobileTab === "quote" && (
          <div className="px-4 py-4 pb-12 animate-in fade-in slide-in-from-right-4 duration-300">
            <QuoteTab
              onGeneratePDF={handleMultiPDF}
            />
          </div>
        )}
      </div>
    </div>
  );
};
