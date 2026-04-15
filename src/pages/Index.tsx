import { useState } from "react";
import { CalculatorForm }     from "@/components/CalculatorForm";
import { ResultsPanel }       from "@/components/ResultsPanel";
import { QuoteTab, QuoteItem } from "@/components/QuoteTab";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { calculateCosts }     from "@/utils/calculator";
import { validateInputs }     from "@/utils/validation";
import { generateQuotePDF }   from "@/utils/pdfGenerator";
import { useToast }           from "@/hooks/use-toast";
import { cn }                 from "@/lib/utils";
import { Calculator, FileText, Printer, ChevronRight, BarChart2 } from "lucide-react";

/* ─── Valores padrão ─── */
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

type DesktopTab  = "calculator" | "quote";
type MobileTab   = "form" | "results" | "quote";

export default function Index() {
  const { toast } = useToast();

  const [desktopTab,  setDesktopTab]  = useState<DesktopTab>("calculator");
  const [mobileTab,   setMobileTab]   = useState<MobileTab>("form");
  const [inputs,      setInputs]      = useState<CalculatorInputs>(DEFAULT);
  const [results,     setResults]     = useState<CalculationResults | null>(null);
  const [calcIn,      setCalcIn]      = useState<CalculatorInputs | null>(null);
  const [quoteItems,  setQuoteItems]  = useState<QuoteItem[]>([]);

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
    setMobileTab("results"); /* mobile: vai para resultados */
  };

  /* ── Adicionar ao orçamento ── */
  const handleAdd = (i: CalculatorInputs, r: CalculationResults) => {
    setQuoteItems((prev) => [...prev, { inputs: i, results: r }]);
    toast({ title: "Item adicionado!", description: `"${i.pieceName}" está no orçamento.` });
    setMobileTab("quote"); /* mobile: vai para orçamento */
  };

  const handleGenerate   = (i: CalculatorInputs, r: CalculationResults) => generateQuotePDF([{ inputs: i, results: r }]);
  const handleMultiPDF   = (items: QuoteItem[]) => generateQuotePDF(items);
  const removeItem       = (i: number) => setQuoteItems((p) => p.filter((_, idx) => idx !== i));

  /* ════════════════════════════════════════════════════════════
     MOBILE LAYOUT  — visível apenas em telas < md (hidden md:block)
  ════════════════════════════════════════════════════════════ */
  const MobileLayout = () => (
    <div className="flex flex-col min-h-[100dvh] bg-[#F5F7FA] md:hidden">

      {/* HEADER mobile */}
      <header className="shrink-0 flex items-center gap-3 px-4 bg-[#1a56db]" style={{ height: "56px", zIndex: 50, boxShadow: "0 1px 6px rgb(0 0 0/.18)" }}>
        <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
          <Printer size={15} className="text-white" />
        </div>
        <h1 className="text-white font-semibold text-[15px] flex-1 truncate">Calculadora 3D Pro</h1>
        {quoteItems.length > 0 && (
          <button onClick={() => setMobileTab("quote")} className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-lg px-2.5 py-1.5">
            <FileText size={14} className="text-white" />
            <span className="text-white text-[12px] font-bold">{quoteItems.length}</span>
          </button>
        )}
      </header>

      {/* NAV mobile — 3 abas */}
      <nav className="shrink-0 flex bg-white border-b border-border sticky top-0" style={{ zIndex: 40 }}>
        {([
          { id: "form"    as MobileTab, label: "Formulário", icon: <Calculator size={16} /> },
          { id: "results" as MobileTab, label: "Resultado",  icon: <BarChart2  size={16} />, locked: !results },
          { id: "quote"   as MobileTab, label: "Orçamento",  icon: <FileText   size={16} />, badge: quoteItems.length || null },
        ] as const).map(({ id, label, icon, locked, badge }: any) => (
          <button
            key={id}
            onClick={() => !locked && setMobileTab(id)}
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
                <span className="absolute -top-1.5 -right-2.5 bg-primary text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
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

        {/* ── ABA: FORMULÁRIO ── */}
        {mobileTab === "form" && (
          <div className="bg-white min-h-full">
            <div className="px-4 py-3 border-b border-border bg-white">
              <h2 className="text-[14px] font-semibold text-foreground">Dados para cálculo</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Preencha e clique em <strong>Calcular custos</strong>
              </p>
            </div>
            <div className="px-4 py-4 pb-12">
              <CalculatorForm inputs={inputs} setInputs={setInputs} onCalculate={handleCalculate} />
            </div>
          </div>
        )}

        {/* ── ABA: RESULTADO ── */}
        {mobileTab === "results" && (
          <div className="min-h-full">
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
                  className="h-11 px-6 rounded-xl bg-primary text-white text-[14px] font-medium flex items-center gap-2 hover:bg-primary/90"
                >
                  <Calculator size={16} /> Ir para Formulário
                </button>
              </div>
            ) : (
              <div className="px-4 py-4 pb-12">
                <ResultsPanel inputs={calcIn} results={results} onGenerateQuote={handleGenerate} onAddToQuote={handleAdd} />
              </div>
            )}
          </div>
        )}

        {/* ── ABA: ORÇAMENTO ── */}
        {mobileTab === "quote" && (
          <div className="px-4 py-4 pb-12">
            <QuoteTab
              items={quoteItems}
              onRemoveItem={removeItem}
              onClearItems={() => setQuoteItems([])}
              onGeneratePDF={handleMultiPDF}
            />
          </div>
        )}
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     DESKTOP LAYOUT  — visível apenas em telas ≥ md (hidden block md:flex)
  ════════════════════════════════════════════════════════════ */
  const DesktopLayout = () => (
    <div className="hidden md:flex flex-col" style={{ height: "100vh", overflow: "hidden" }}>

      {/* HEADER desktop */}
      <header
        className="shrink-0 flex items-center justify-between px-7"
        style={{ height: "60px", background: "#1a56db", boxShadow: "0 1px 6px rgb(0 0 0/.18)", zIndex: 50 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
            <Printer size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-[16px] leading-none">Calculadora 3D Pro</h1>
            <p className="text-white/55 text-[12px] mt-0.5">Precificação profissional para impressão 3D</p>
          </div>
        </div>
      </header>

      {/* TABS desktop */}
      <nav className="shrink-0 flex items-stretch px-4 bg-white border-b border-border" style={{ height: "48px", zIndex: 40 }}>
        {([
          { id: "calculator" as DesktopTab, label: "Calculadora", icon: <Calculator size={15} /> },
          { id: "quote"      as DesktopTab, label: "Orçamento",   icon: <FileText   size={15} />, badge: quoteItems.length || null },
        ] as const).map(({ id, label, icon, badge }: any) => (
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
              <span className="bg-primary text-white text-[11px] font-semibold rounded-full w-5 h-5 flex items-center justify-center">{badge}</span>
            ) : null}
          </button>
        ))}
      </nav>

      {/* CONTEÚDO desktop */}
      <div className="flex flex-1 overflow-hidden">

        {/* ABA CALCULADORA */}
        {desktopTab === "calculator" && (
          <>
            {/* Coluna formulário */}
            <div className="bg-white border-r border-border flex flex-col overflow-hidden" style={{ width: "55%", minWidth: "520px" }}>
              <div className="shrink-0 px-8 py-4 border-b border-border bg-white">
                <h2 className="text-[15px] font-semibold text-foreground">Dados para cálculo</h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">Preencha todas as seções e clique em <strong>Calcular custos</strong></p>
              </div>
              <div className="flex-1 overflow-y-auto px-8 py-7">
                <CalculatorForm inputs={inputs} setInputs={setInputs} onCalculate={handleCalculate} />
              </div>
            </div>

            {/* Coluna resultados */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#F5F7FA]">
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
                  <ResultsPanel inputs={calcIn} results={results} onGenerateQuote={handleGenerate} onAddToQuote={handleAdd} />
                </div>
              )}
            </div>
          </>
        )}

        {/* ABA ORÇAMENTO */}
        {desktopTab === "quote" && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-8 py-8">
              <QuoteTab items={quoteItems} onRemoveItem={removeItem} onClearItems={() => setQuoteItems([])} onGeneratePDF={handleMultiPDF} />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <MobileLayout />
      <DesktopLayout />
    </>
  );
}
