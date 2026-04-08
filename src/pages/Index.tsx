import { useState, useEffect } from "react";
import { CalculatorForm }     from "@/components/CalculatorForm";
import { ResultsPanel }       from "@/components/ResultsPanel";
import { QuoteTab, QuoteItem } from "@/components/QuoteTab";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { calculateCosts }     from "@/utils/calculator";
import { validateInputs }     from "@/utils/validation";
import { generateQuotePDF }   from "@/utils/pdfGenerator";
import { useToast }           from "@/hooks/use-toast";
import { cn }                 from "@/lib/utils";
import { Calculator, FileText, Printer, ChevronRight } from "lucide-react";

/* ─── Valores padrão ─── */
const DEFAULT: CalculatorInputs = {
  clientName:      "",
  pieceName:       "",
  quantity:        1,
  material:        "PLA",
  manualPainting:  false,
  filamentPrice:   100,
  filamentUsed:    0,
  printTimeHours:  0,
  printTimeMinutes:0,
  printerPower:    250,
  energyRate:      0.75,
  printerValue:    5000,
  printerLifespan: 5000,
  hourlyRate:      0,
  activeWorkTime:  0,
  finishingCost:   0,
  maintenanceCost: 1,
  failureRate:     5,
  complexity:      "simple",
  profitMargin:    30,
  additionalFee:   0,
  desiredPrice:    undefined,
  roundPrice:      false,
  packagingCost:   0,
  extraCost:       0,
  wholesaleDiscount: 0,
  useWholesalePrice: false,
};

type Tab = "calculator" | "quote";

export default function Index() {
  const { toast } = useToast();

  const [tab, setTab]         = useState<Tab>("calculator");
  const [inputs, setInputs]   = useState<CalculatorInputs>(DEFAULT);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [calcIn,  setCalcIn]  = useState<CalculatorInputs | null>(null);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);

  /* ── Calcular ── */
  const handleCalculate = (data: CalculatorInputs) => {
    const v = validateInputs(data);
    if (!v.success) {
      toast({
        title: "Campo inválido",
        description: v.error.errors[0]?.message ?? "Verifique os dados.",
        variant: "destructive",
      });
      return;
    }
    const r = calculateCosts(data);
    setResults(r);
    setCalcIn(data);
    toast({ title: "Cálculo concluído!", description: `"${data.pieceName}" precificado com sucesso.` });
  };

  /* ── Adicionar ao orçamento ── */
  const handleAdd = (i: CalculatorInputs, r: CalculationResults) => {
    setQuoteItems((prev) => [...prev, { inputs: i, results: r }]);
    toast({ title: "Item adicionado!", description: `"${i.pieceName}" está no orçamento.` });
  };

  /* ── Gerar PDF de 1 item ── */
  const handleGenerate = (i: CalculatorInputs, r: CalculationResults) => {
    generateQuotePDF([{ inputs: i, results: r }]);
  };

  /* ── Gerar PDF multi-item ── */
  const handleMultiPDF = (items: QuoteItem[]) => {
    generateQuotePDF(items);
  };

  return (
    <div className="flex flex-col" style={{ height: "100vh", overflow: "hidden" }}>

      {/* ══════════ HEADER ══════════ */}
      <header
        className="shrink-0 flex items-center justify-between px-7"
        style={{
          height: "60px",
          background: "#1a56db",
          boxShadow: "0 1px 6px rgb(0 0 0 / 0.18)",
          zIndex: 50,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
            <Printer size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-[16px] leading-none">
              Calculadora 3D Pro
            </h1>
            <p className="text-white/55 text-[12px] mt-0.5">
              Precificação profissional para impressão 3D
            </p>
          </div>
        </div>
      </header>

      {/* ══════════ TABS ══════════ */}
      <nav
        className="shrink-0 flex items-stretch px-4 bg-white border-b border-border"
        style={{ height: "48px", zIndex: 40 }}
      >
        {(
          [
            { id: "calculator" as Tab, label: "Calculadora",     icon: <Calculator size={15} /> },
            { id: "quote"      as Tab, label: "Orçamento",       icon: <FileText   size={15} />, badge: quoteItems.length || null },
          ] as const
        ).map(({ id, label, icon, badge }: any) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 px-5 text-[14px] font-medium border-b-2 transition-all",
              tab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            {icon}
            {label}
            {badge ? (
              <span className="bg-primary text-white text-[11px] font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                {badge}
              </span>
            ) : null}
          </button>
        ))}
      </nav>

      {/* ══════════ CONTEÚDO ══════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── ABA CALCULADORA ── */}
        {tab === "calculator" && (
          <>
            {/* Coluna formulário — mais larga */}
            <div
              className="bg-white border-r border-border flex flex-col overflow-hidden"
              style={{ width: "55%", minWidth: "520px" }}
            >
              {/* Título da coluna */}
              <div className="shrink-0 px-8 py-4 border-b border-border bg-white">
                <h2 className="text-[15px] font-semibold text-foreground">
                  Dados para cálculo
                </h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  Preencha todas as seções e clique em <strong>Calcular custos</strong>
                </p>
              </div>

              {/* Scroll do formulário */}
              <div className="flex-1 overflow-y-auto px-8 py-7">
                <CalculatorForm
                  inputs={inputs}
                  setInputs={setInputs}
                  onCalculate={handleCalculate}
                />
              </div>
            </div>

            {/* Coluna resultados */}
            <div
              className="flex-1 flex flex-col overflow-hidden bg-[#F5F7FA]"
            >
              {/* Título da coluna */}
              <div className="shrink-0 px-7 py-4 border-b border-border bg-white">
                <h2 className="text-[15px] font-semibold text-foreground">Resultado</h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  Análise de custos, margem e ROI
                </p>
              </div>

              {/* Estado vazio / resultados */}
              {!results || !calcIn ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-8 space-y-5">
                  <div className="w-20 h-20 rounded-3xl bg-primary/8 border border-primary/15 flex items-center justify-center">
                    <Calculator size={34} className="text-primary/50" />
                  </div>
                  <div className="max-w-[260px]">
                    <p className="text-[15px] font-semibold text-foreground">
                      Pronto para calcular
                    </p>
                    <p className="text-[13px] text-muted-foreground mt-1.5">
                      Preencha o formulário ao lado e clique em{" "}
                      <strong className="text-foreground">Calcular custos</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    <span>Preencha</span>
                    <ChevronRight size={12} />
                    <span>Calcule</span>
                    <ChevronRight size={12} />
                    <span>Gere o PDF</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-7 py-6">
                  <ResultsPanel
                    inputs={calcIn}
                    results={results}
                    onGenerateQuote={handleGenerate}
                    onAddToQuote={handleAdd}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* ── ABA ORÇAMENTO ── */}
        {tab === "quote" && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-8 py-8">
              <QuoteTab
                items={quoteItems}
                onRemoveItem={(i) => setQuoteItems((p) => p.filter((_, idx) => idx !== i))}
                onClearItems={() => setQuoteItems([])}
                onGeneratePDF={handleMultiPDF}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
