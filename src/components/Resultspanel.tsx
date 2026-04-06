import { useState, useEffect } from "react";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { calculateCosts, formatBRL, formatTime } from "@/utils/calculator";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Clock,
  Package,
  BarChart2,
  AlertTriangle,
  CheckCircle,
  Info,
  Plus,
  FileDown,
  ChevronDown,
  ChevronUp,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultsPanelProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
  onGenerateQuote: (inputs: CalculatorInputs, results: CalculationResults) => void;
  onAddItemToQuote: (inputs: CalculatorInputs, results: CalculationResults) => void;
}

// ─────────────────────────── sub-components ───────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
  icon?: React.ReactNode;
}

const variantClasses = {
  default: "bg-muted/50 border-border",
  primary: "bg-primary/8 border-primary/20",
  success: "bg-success/8 border-success/20",
  warning: "bg-warning/8 border-warning/20",
  destructive: "bg-destructive/8 border-destructive/20",
};

const valueClasses = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

const MetricCard = ({
  label,
  value,
  sub,
  variant = "default",
  icon,
}: MetricCardProps) => (
  <div
    className={cn(
      "rounded-xl border p-4 space-y-1 transition-all hover:shadow-sm",
      variantClasses[variant]
    )}
  >
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      {icon && (
        <div className="opacity-40">{icon}</div>
      )}
    </div>
    <p className={cn("text-2xl font-semibold font-mono tracking-tight", valueClasses[variant])}>
      {value}
    </p>
    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
  </div>
);

interface BreakdownItemProps {
  label: string;
  value: number;
  total: number;
  color?: string;
}

const BreakdownItem = ({ label, value, total, color = "bg-primary" }: BreakdownItemProps) => {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium text-foreground">
          {formatBRL(value)}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─────────────────────────── main component ───────────────────────────

export const ResultsPanel = ({
  inputs,
  results: initialResults,
  onGenerateQuote,
  onAddItemToQuote,
}: ResultsPanelProps) => {
  const [sliderMargin, setSliderMargin] = useState(inputs.profitMargin);
  const [simResults, setSimResults] = useState<CalculationResults>(initialResults);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [useWholesale, setUseWholesale] = useState(inputs.useWholesalePrice ?? false);

  const qty = Math.max(1, inputs.quantity || 1);
  const hasWholesale = (inputs.wholesaleDiscount ?? 0) > 0;

  useEffect(() => {
    setSliderMargin(inputs.profitMargin);
    setSimResults(initialResults);
  }, [inputs, initialResults]);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderMargin(val);
    const updated = calculateCosts({ ...inputs, profitMargin: val, desiredPrice: undefined });
    setSimResults(updated);
  };

  const getActionInputs = () => ({
    ...inputs,
    profitMargin: sliderMargin,
    useWholesalePrice: useWholesale,
  });

  const getActionResults = () => simResults;

  const round = inputs.roundPrice;
  const fmt = (v: number) => formatBRL(v, round);

  // active price (slider simulation)
  const activePrice = simResults.finalPriceWithFee;
  const activePricePerUnit = simResults.finalPricePerUnit;
  const activeProfit = simResults.profitAmount;
  const activeProfitPerUnit = simResults.profitPerUnit;
  const activeMargin = simResults.netMarginPercent;

  // Price analysis
  const desiredPrice = inputs.desiredPrice;
  const hasPriceAnalysis = desiredPrice && desiredPrice > 0;
  const priceDiff = hasPriceAnalysis ? desiredPrice - initialResults.finalPriceWithFee : 0;
  const priceDiffPct = initialResults.finalPriceWithFee > 0
    ? (priceDiff / initialResults.finalPriceWithFee) * 100
    : 0;
  const priceStatus =
    priceDiffPct < -10 ? "low" : priceDiffPct <= 15 ? "ideal" : "high";

  // ROI
  const profitPerUnit = initialResults.profitPerUnit;
  const piecesToRecover =
    profitPerUnit > 0 ? Math.ceil(inputs.printerValue / profitPerUnit) : null;
  const monthsToRecover = piecesToRecover ? (piecesToRecover / 30).toFixed(1) : null;
  const monthlyProfit = profitPerUnit > 0 ? profitPerUnit * 30 : null;

  // Breakdown
  const breakdownItems = [
    { label: "Filamento", value: initialResults.filamentCost, color: "bg-primary" },
    { label: "Energia elétrica", value: initialResults.energyCost, color: "bg-primary/70" },
    { label: "Desgaste da impressora", value: initialResults.wearCost, color: "bg-primary/50" },
    { label: "Mão de obra", value: initialResults.laborCost, color: "bg-accent" },
    { label: "Manutenção", value: initialResults.maintenanceTotalCost, color: "bg-accent/70" },
    { label: "Acabamento", value: inputs.finishingCost || 0, color: "bg-warning" },
    { label: "Embalagem", value: initialResults.packagingCost, color: "bg-warning/70" },
    { label: "Extras", value: initialResults.extraCost, color: "bg-muted-foreground/50" },
    { label: `Margem de falha (${inputs.failureRate}%)`, value: initialResults.failureCost, color: "bg-destructive/60" },
  ].filter((item) => item.value > 0);

  const totalH = Math.floor(initialResults.totalTime);
  const totalM = Math.round((initialResults.totalTime - totalH) * 60);

  return (
    <div className="space-y-5 animate-in">
      {/* ── PRICE HERO ── */}
      <div className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg shadow-primary/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-primary-foreground/70 text-sm font-medium mb-1">
              Preço de venda sugerido
            </p>
            <p className="text-4xl font-semibold font-mono tracking-tight">
              {fmt(initialResults.finalPriceWithFee)}
            </p>
            <p className="text-primary-foreground/60 text-sm mt-1.5">
              por peça: {fmt(initialResults.finalPricePerUnit)}
            </p>
            {qty > 1 && (
              <p className="text-primary-foreground/50 text-xs mt-0.5">
                lote de {qty} peças
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="bg-white/15 border border-white/20 rounded-xl px-4 py-2 text-center min-w-[90px]">
              <p className="text-primary-foreground/60 text-xs mb-0.5">Margem líquida</p>
              <p className="text-xl font-semibold font-mono">
                {initialResults.netMarginPercent.toFixed(1)}%
              </p>
            </div>
            {hasWholesale && (
              <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-2 text-center min-w-[90px]">
                <p className="text-primary-foreground/60 text-xs mb-0.5">
                  Atacado ({inputs.wholesaleDiscount}% off)
                </p>
                <p className="text-lg font-semibold font-mono">
                  {fmt(initialResults.wholesalePrice)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── PRICE ANALYSIS ── */}
      {hasPriceAnalysis && (
        <div
          className={cn(
            "rounded-xl border p-4",
            priceStatus === "low" && "bg-destructive/5 border-destructive/20",
            priceStatus === "ideal" && "bg-success/5 border-success/20",
            priceStatus === "high" && "bg-warning/5 border-warning/20"
          )}
        >
          <div className="flex items-start gap-3">
            {priceStatus === "low" && (
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            )}
            {priceStatus === "ideal" && (
              <CheckCircle className="w-5 h-5 text-success mt-0.5 shrink-0" />
            )}
            {priceStatus === "high" && (
              <Info className="w-5 h-5 text-warning mt-0.5 shrink-0" />
            )}
            <div className="flex-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  priceStatus === "low" && "text-destructive",
                  priceStatus === "ideal" && "text-success",
                  priceStatus === "high" && "text-warning"
                )}
              >
                {priceStatus === "low" && "Preço abaixo do recomendado"}
                {priceStatus === "ideal" && "Preço dentro da faixa ideal"}
                {priceStatus === "high" && "Preço acima do recomendado"}
              </p>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { label: "Seu preço", value: fmt(desiredPrice!) },
                  { label: "Sugerido", value: fmt(initialResults.finalPriceWithFee) },
                  {
                    label: "Diferença",
                    value: `${priceDiff >= 0 ? "+" : ""}${fmt(priceDiff)}`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-background/60 rounded-lg p-2 text-center"
                  >
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-semibold font-mono mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── METRICS GRID ── */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Custo de produção"
          value={fmt(initialResults.productionCost)}
          sub={`por unidade: ${fmt(initialResults.costPerUnit)}`}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <MetricCard
          label="Lucro líquido"
          value={fmt(initialResults.profitAmount)}
          sub={`por unidade: ${fmt(initialResults.profitPerUnit)}`}
          variant={initialResults.profitAmount >= 0 ? "success" : "destructive"}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <MetricCard
          label="Preço final c/ taxas"
          value={fmt(initialResults.finalPriceWithFee)}
          sub={inputs.additionalFee > 0 ? `inclui ${inputs.additionalFee}% de taxa` : "sem taxa adicional"}
          variant="primary"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <MetricCard
          label="Tempo total"
          value={formatTime(initialResults.totalTime)}
          sub={`impressão + ${inputs.activeWorkTime}h trabalho`}
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      {/* ── MARGIN SIMULATOR ── */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Simulador de margem</span>
          </div>
          <span className="font-mono text-lg font-semibold text-primary">
            {sliderMargin}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="500"
          step="1"
          value={sliderMargin}
          onChange={handleSlider}
          className="w-full"
          style={{
            accentColor: "hsl(var(--primary))",
          }}
        />

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Preço simulado</p>
            <p className="font-mono font-semibold text-foreground">
              {fmt(simResults.finalPriceWithFee)}
            </p>
          </div>
          <div className="bg-success/8 border border-success/20 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Lucro simulado</p>
            <p className="font-mono font-semibold text-success">
              {fmt(simResults.profitAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* ── BREAKDOWN ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Composição dos custos</span>
            <Badge variant="secondary" className="text-xs font-mono">
              {formatBRL(initialResults.productionCost)}
            </Badge>
          </div>
          {showBreakdown ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {showBreakdown && (
          <div className="px-4 pb-4 space-y-3 border-t border-border">
            <div className="pt-3 space-y-3">
              {breakdownItems.map((item) => (
                <BreakdownItem
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  total={initialResults.productionCost}
                  color={item.color}
                />
              ))}
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total de produção</span>
              <span className="font-mono font-semibold text-primary">
                {formatBRL(initialResults.productionCost)}
              </span>
            </div>
            {inputs.additionalFee > 0 && (
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Taxa marketplace ({inputs.additionalFee}%)</span>
                <span className="font-mono">
                  {formatBRL(initialResults.finalPriceWithFee - initialResults.finalPrice)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ROI ── */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Retorno sobre investimento</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: <Package className="w-5 h-5 text-primary" />,
              value: piecesToRecover
                ? piecesToRecover.toLocaleString("pt-BR")
                : "—",
              label: "peças para recuperar a impressora",
            },
            {
              icon: <Clock className="w-5 h-5 text-accent" />,
              value: monthsToRecover ? `${monthsToRecover}m` : "—",
              label: "meses estimados (30 peças/mês)",
            },
            {
              icon: <DollarSign className="w-5 h-5 text-success" />,
              value: monthlyProfit ? formatBRL(monthlyProfit) : "—",
              label: "lucro mensal estimado",
            },
          ].map((item, i) => (
            <div key={i} className="bg-muted/40 rounded-lg p-3 text-center">
              <div className="flex justify-center mb-2">{item.icon}</div>
              <p className="font-mono font-semibold text-base text-foreground">
                {item.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-tight">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── WHOLESALE TOGGLE ── */}
      {hasWholesale && (
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-xl border border-border">
          <div>
            <p className="text-sm font-medium">Usar preço de atacado no PDF</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatBRL(initialResults.wholesalePrice)} ao invés de{" "}
              {formatBRL(initialResults.finalPriceWithFee)}
            </p>
          </div>
          <Switch
            checked={useWholesale}
            onCheckedChange={setUseWholesale}
          />
        </div>
      )}

      {/* ── ACTIONS ── */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-10 border-border hover:bg-muted/50"
          onClick={() => onAddItemToQuote(getActionInputs(), getActionResults())}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar ao orçamento
        </Button>
        <Button
          className="h-10 bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20"
          onClick={() => onGenerateQuote(getActionInputs(), getActionResults())}
        >
          <FileDown className="w-4 h-4 mr-2" />
          Gerar PDF
        </Button>
      </div>
    </div>
  );
};