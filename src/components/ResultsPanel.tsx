import { useState, useEffect } from "react";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { calculateCosts, fmtBRL, fmtTime } from "@/utils/calculator";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  Clock,
  Package,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Plus,
  FileDown,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

interface Props {
  inputs: CalculatorInputs;
  results: CalculationResults;
  onGenerateQuote: (i: CalculatorInputs, r: CalculationResults) => void;
  onAddToQuote: (i: CalculatorInputs, r: CalculationResults) => void;
}

/* ── Cartão de métrica simples ── */
const MetricCard = ({
  label,
  value,
  sub,
  variant = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  variant?: "default" | "blue" | "green";
}) => (
  <div
    className={cn(
      "rounded-xl border p-4 space-y-1 shadow-sm transition-all hover:shadow-md",
      variant === "default" && "bg-white/60 glass border-border",
      variant === "blue"    && "bg-blue-50/70 glass border-blue-200",
      variant === "green"   && "bg-green-50/70 glass border-green-200"
    )}
  >
    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
      {label}
    </p>
    <p
      className={cn(
        "text-[22px] font-semibold font-mono leading-none",
        variant === "default" && "text-foreground",
        variant === "blue"    && "text-blue-800",
        variant === "green"   && "text-green-800"
      )}
    >
      {value}
    </p>
    {sub && (
      <p className="text-[12px] text-muted-foreground">{sub}</p>
    )}
  </div>
);

/* ── Barra de custo ── */
const BreakdownRow = ({
  label,
  value,
  total,
  color = "bg-primary",
}: {
  label: string;
  value: number;
  total: number;
  color?: string;
}) => {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[13px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium text-foreground">{fmtBRL(value)}</span>
      </div>
      <div className="h-[3px] bg-border rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct.toFixed(1)}%` }}
        />
      </div>
    </div>
  );
};

export const ResultsPanel = ({ inputs, results: init, onGenerateQuote, onAddToQuote }: Props) => {
  const [sliderVal, setSliderVal]   = useState(inputs.profitMargin);
  const [simR, setSimR]             = useState<CalculationResults>(init);
  const [showBreak, setShowBreak]   = useState(false);
  const [useWholesale, setUseWholesale] = useState(inputs.useWholesalePrice ?? false);

  const qty         = Math.max(1, inputs.quantity || 1);
  const round       = inputs.roundPrice;
  const hasWholesale = (inputs.wholesaleDiscount ?? 0) > 0;
  const fmt         = (v: number) => fmtBRL(v, round);

  useEffect(() => {
    setSliderVal(inputs.profitMargin);
    setSimR(init);
  }, [inputs, init]);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setSliderVal(v);
    setSimR(calculateCosts({ ...inputs, profitMargin: v, desiredPrice: undefined }));
  };

  const actionInputs  = () => ({ ...inputs, profitMargin: sliderVal, useWholesalePrice: useWholesale });
  const actionResults = () => simR;

  /* Análise do preço desejado */
  const desired = inputs.desiredPrice;
  const hasDes  = (desired ?? 0) > 0;
  const diff    = hasDes ? desired! - init.finalPriceWithFee : 0;
  const diffPct = init.finalPriceWithFee > 0 ? (diff / init.finalPriceWithFee) * 100 : 0;
  const status  = diffPct < -10 ? "low" : diffPct <= 15 ? "ideal" : "high";

  /* ROI */
  const ppu           = init.profitPerUnit;
  const pieces        = ppu > 0 ? Math.ceil(inputs.printerValue / ppu) : null;
  const months        = pieces ? (pieces / 30).toFixed(1) : null;
  const monthlyProfit = ppu > 0 ? ppu * 30 : null;

  /* Breakdown */
  const breaks = [
    { label: "Filamento",           value: init.filamentCost,         color: "bg-blue-500" },
    { label: "Energia elétrica",    value: init.energyCost,           color: "bg-blue-400" },
    { label: "Desgaste impressora", value: init.wearCost,             color: "bg-blue-300" },
    { label: "Mão de obra",         value: init.laborCost,            color: "bg-green-500" },
    { label: "Manutenção",          value: init.maintenanceTotalCost, color: "bg-green-400" },
    { label: "Acabamento",          value: inputs.finishingCost || 0, color: "bg-yellow-400" },
    { label: "Embalagem",           value: init.packagingCost,        color: "bg-yellow-300" },
    { label: "Extras",              value: init.extraCost,            color: "bg-gray-400" },
    {
      label: `Margem de falha (${inputs.failureRate}%)`,
      value: init.failureCost,
      color: "bg-red-400",
    },
  ].filter((b) => b.value > 0);

  return (
    <div className="space-y-4 slide-up">

      {/* ── HERO: Preço principal ── */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-violet-700 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <p className="text-[12px] font-medium text-white/70 uppercase tracking-wider mb-1 relative z-10">
          Preço de venda sugerido
        </p>
        <p className="text-[28px] sm:text-[40px] font-semibold font-mono leading-none tracking-tight">
          {fmt(init.finalPriceWithFee)}
        </p>
        <p className="text-[13px] text-white/55 mt-1.5">
          por peça: {fmt(init.finalPricePerUnit)}
          {qty > 1 && ` · lote de ${qty} peças`}
        </p>

        {/* Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="bg-white/15 border border-white/20 rounded-full px-3 py-1 text-[12px] text-white">
            <span className="text-white/55 mr-1">Margem</span>
            {init.netMarginPercent.toFixed(1)}%
          </span>
          <span className="bg-white/15 border border-white/20 rounded-full px-3 py-1 text-[12px] text-white">
            <span className="text-white/55 mr-1">Lucro</span>
            {fmt(init.profitAmount)}
          </span>
          {hasWholesale && (
            <span className="bg-white/10 border border-white/15 rounded-full px-3 py-1 text-[12px] text-white">
              <span className="text-white/55 mr-1">Atacado</span>
              {fmt(init.wholesalePrice)}
            </span>
          )}
        </div>
      </div>

      {/* ── Análise do preço desejado ── */}
      {hasDes && (
        <div
          className={cn(
            "rounded-xl border p-4",
            status === "low"  && "bg-red-50 border-red-200",
            status === "ideal"&& "bg-green-50 border-green-200",
            status === "high" && "bg-yellow-50 border-yellow-200",
          )}
        >
          <div className="flex gap-3 items-start">
            {status === "low"   && <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />}
            {status === "ideal" && <CheckCircle   size={18} className="text-green-700 mt-0.5 shrink-0" />}
            {status === "high"  && <Info          size={18} className="text-yellow-700 mt-0.5 shrink-0" />}
            <div>
              <p className={cn("text-[14px] font-semibold",
                status === "low"  && "text-red-800",
                status === "ideal"&& "text-green-800",
                status === "high" && "text-yellow-800",
              )}>
                {status === "low"  && "Preço abaixo do recomendado"}
                {status === "ideal"&& "Preço dentro da faixa ideal"}
                {status === "high" && "Preço acima do recomendado"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                {[
                  { label: "Seu preço",  val: fmt(desired!) },
                  { label: "Sugerido",   val: fmt(init.finalPriceWithFee) },
                  { label: "Diferença",  val: `${diff >= 0 ? "+" : ""}${fmt(diff)}` },
                ].map((c) => (
                  <div key={c.label} className="bg-white/70 rounded-lg p-2 text-center">
                    <p className="text-[11px] text-muted-foreground">{c.label}</p>
                    <p className="text-[13px] font-semibold font-mono mt-0.5">{c.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Grid de métricas ── */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Custo de produção"
          value={fmt(init.productionCost)}
          sub={`por unidade: ${fmt(init.costPerUnit)}`}
        />
        <MetricCard
          label="Lucro líquido"
          value={fmt(init.profitAmount)}
          sub={`por unidade: ${fmt(init.profitPerUnit)}`}
          variant={init.profitAmount >= 0 ? "green" : "default"}
        />
        <MetricCard
          label="Preço c/ taxas"
          value={fmt(init.finalPriceWithFee)}
          sub={inputs.additionalFee > 0 ? `inclui ${inputs.additionalFee}% de taxa` : "sem taxa extra"}
          variant="blue"
        />
        <MetricCard
          label="Tempo total"
          value={fmtTime(init.totalTime)}
          sub={`impressão + ${inputs.activeWorkTime}h trabalho`}
        />
      </div>

      {/* ── Simulador de margem ── */}
      <div className="rounded-xl border border-border bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-primary" />
            <span className="text-[14px] font-medium text-foreground">
              Simulador de margem
            </span>
          </div>
          <span className="text-[22px] font-semibold font-mono text-primary">
            {sliderVal}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="500"
          step="1"
          value={sliderVal}
          onChange={handleSlider}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-[11px] text-muted-foreground mb-1">Preço simulado</p>
            <p className="text-[16px] font-semibold font-mono text-foreground">
              {fmt(simR.finalPriceWithFee)}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-[11px] text-muted-foreground mb-1">Lucro simulado</p>
            <p className="text-[16px] font-semibold font-mono text-green-800">
              {fmt(simR.profitAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Breakdown de custos ── */}
      <div className="rounded-xl border border-border bg-white overflow-hidden">
        <button
          onClick={() => setShowBreak(!showBreak)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium text-foreground">
              Composição dos custos
            </span>
            <span className="text-[12px] text-muted-foreground font-mono">
              {fmt(init.productionCost)}
            </span>
          </div>
          {showBreak
            ? <ChevronUp   size={16} className="text-muted-foreground" />
            : <ChevronDown size={16} className="text-muted-foreground" />
          }
        </button>

        {showBreak && (
          <div className="px-5 pb-5 border-t border-border space-y-3 pt-4">
            {breaks.map((b) => (
              <BreakdownRow
                key={b.label}
                label={b.label}
                value={b.value}
                total={init.productionCost}
                color={b.color}
              />
            ))}
            <div className="pt-3 border-t border-border flex justify-between text-[13px]">
              <span className="font-medium text-foreground">Total de produção</span>
              <span className="font-semibold font-mono text-primary">
                {fmtBRL(init.productionCost)}
              </span>
            </div>
            {inputs.additionalFee > 0 && (
              <div className="flex justify-between text-[13px] text-muted-foreground">
                <span>Taxa marketplace ({inputs.additionalFee}%)</span>
                <span className="font-mono">
                  {fmtBRL(init.finalPriceWithFee - init.finalPrice)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ROI ── */}
      <div className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-primary" />
          <span className="text-[14px] font-medium text-foreground">
            Retorno sobre investimento
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: <Package  size={18} className="text-primary" />,
              value: pieces ? pieces.toLocaleString("pt-BR") : "—",
              label: "peças para recuperar a impressora",
            },
            {
              icon: <Clock    size={18} className="text-blue-600" />,
              value: months ? `${months}m` : "—",
              label: "meses (est. 30 pç/mês)",
            },
            {
              icon: <DollarSign size={18} className="text-green-700" />,
              value: monthlyProfit ? fmtBRL(monthlyProfit) : "—",
              label: "lucro mensal estimado",
            },
          ].map((c, i) => (
            <div key={i} className="bg-secondary rounded-lg p-3 text-center">
              <div className="flex justify-center mb-2">{c.icon}</div>
              <p className="text-[15px] font-semibold font-mono text-foreground">{c.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{c.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Toggle atacado ── */}
      {hasWholesale && (
        <label className="flex items-center justify-between px-4 py-3.5 bg-secondary rounded-xl border border-border cursor-pointer">
          <div>
            <p className="text-[14px] font-medium text-foreground">
              Usar preço de atacado no PDF
            </p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {fmt(init.wholesalePrice)} em vez de {fmt(init.finalPriceWithFee)}
            </p>
          </div>
          <input
            type="checkbox"
            checked={useWholesale}
            onChange={(e) => setUseWholesale(e.target.checked)}
            className="w-[18px] h-[18px] accent-primary cursor-pointer"
          />
        </label>
      )}

      {/* ── Ações ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
        <button
          onClick={() => onAddToQuote(actionInputs(), actionResults())}
          className="
            h-12 rounded-xl border border-border bg-white
            hover:bg-secondary text-[14px] font-medium text-foreground
            flex items-center justify-center gap-2 transition-colors
          "
        >
          <Plus size={16} />
          Adicionar ao orçamento
        </button>
        <button
          onClick={() => onGenerateQuote(actionInputs(), actionResults())}
          className="
            h-12 rounded-xl bg-primary hover:bg-primary/90
            text-[14px] font-medium text-white
            flex items-center justify-center gap-2 transition-colors
          "
        >
          <FileDown size={16} />
          Gerar PDF
        </button>
      </div>
    </div>
  );
};
