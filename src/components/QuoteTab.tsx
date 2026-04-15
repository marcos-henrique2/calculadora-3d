import { useState } from "react";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { fmtBRL, fmtTime } from "@/utils/calculator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  Download,
  Trash2,
  X,
  Package,
  FileText,
  AlertCircle,
} from "lucide-react";

export type QuoteItem = {
  inputs: CalculatorInputs;
  results: CalculationResults;
};

interface Props {
  items: QuoteItem[];
  onRemoveItem: (index: number) => void;
  onClearItems: () => void;
  onGeneratePDF: (items: QuoteItem[]) => void;
}

export const QuoteTab = ({ items, onRemoveItem, onClearItems, onGeneratePDF }: Props) => {
  const { toast } = useToast();
  const [confirmClear, setConfirmClear] = useState(false);

  const grandTotal = items.reduce((acc, { inputs, results }) => {
    const qty  = Math.max(1, Number(inputs.quantity) || 1);
    const useW = !!inputs.useWholesalePrice && (inputs.wholesaleDiscount ?? 0) > 0;
    const raw  = useW ? results.wholesalePrice : results.finalPriceWithFee;
    return acc + (inputs.roundPrice ? Math.round(raw) : raw);
  }, 0);

  const handleGenerate = () => {
    if (!items.length) {
      toast({ title: "Orçamento vazio", description: "Adicione itens antes de gerar o PDF.", variant: "destructive" });
      return;
    }
    try {
      onGeneratePDF(items);
      toast({ title: "PDF gerado!", description: `${items.length} item(s) incluídos.` });
    } catch {
      toast({ title: "Erro ao gerar PDF", variant: "destructive" });
    }
  };

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    onClearItems();
    setConfirmClear(false);
    toast({ title: "Orçamento limpo" });
  };

  /* ── Estado vazio ── */
  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] text-center px-6 space-y-5">
        <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center">
          <ShoppingCart size={36} className="text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-[16px] font-semibold text-foreground">Nenhum item ainda</h3>
          <p className="text-[14px] text-muted-foreground mt-1.5 max-w-xs">
            Calcule um item na aba <strong>Calculadora</strong> e clique em
            {" "}<strong>Adicionar ao orçamento</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Cabeçalho ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FileText size={18} className="text-primary" />
          <h2 className="text-[16px] font-semibold text-foreground">Itens do orçamento</h2>
          <span className="bg-primary text-white text-[12px] font-medium rounded-full w-6 h-6 flex items-center justify-center">
            {items.length}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            className={cn(
              "flex-1 sm:flex-none h-9 px-4 rounded-lg border text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors",
              confirmClear
                ? "border-destructive text-destructive bg-red-50 hover:bg-red-100"
                : "border-border bg-white text-foreground hover:bg-secondary"
            )}
          >
            {confirmClear ? <AlertCircle size={14} /> : <Trash2 size={14} />}
            {confirmClear ? "Confirmar limpeza" : "Limpar"}
          </button>
          <button
            onClick={handleGenerate}
            className="flex-1 sm:flex-none h-9 px-5 rounded-lg bg-primary hover:bg-primary/90 text-[13px] font-medium text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            Gerar PDF
          </button>
        </div>
      </div>

      {/* ── Tabela ── */}
      <div className="rounded-xl border border-border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]" style={{ tableLayout: "auto" }}>
            <thead>
              <tr className="bg-secondary border-b border-border">
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Qtd.</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Descrição</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden sm:table-cell">Material</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden sm:table-cell">Peso</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden md:table-cell">Tempo</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Total</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden sm:table-cell">Unit.</th>
                <th className="px-3 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(({ inputs, results }, idx) => {
                const qty   = Math.max(1, Number(inputs.quantity) || 1);
                const round = inputs.roundPrice;
                const useW  = !!inputs.useWholesalePrice && (inputs.wholesaleDiscount ?? 0) > 0;
                const raw   = useW ? results.wholesalePrice : results.finalPriceWithFee;
                const total = round ? Math.round(raw) : raw;
                const unit  = total / qty;

                return (
                  <tr
                    key={idx}
                    className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    {/* Qtd */}
                    <td className="px-3 py-3.5">
                      <span className="font-mono font-semibold text-foreground">{qty}×</span>
                    </td>

                    {/* Descrição + imagem */}
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2">
                        {(inputs as any).productImage ? (
                          <img
                            src={(inputs as any).productImage}
                            alt=""
                            className="w-8 h-8 rounded-md object-cover border border-border shrink-0 hidden sm:block"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center shrink-0 hidden sm:flex">
                            <Package size={13} className="text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate max-w-[120px] sm:max-w-none">
                            {inputs.pieceName}
                          </p>
                          {inputs.clientName && (
                            <p className="text-[12px] text-muted-foreground truncate">
                              {inputs.clientName}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Material */}
                    <td className="px-3 py-3.5 hidden sm:table-cell">
                      <span className="bg-secondary border border-border rounded-md px-2 py-0.5 text-[12px] font-medium text-foreground">
                        {inputs.material}
                      </span>
                    </td>

                    {/* Peso */}
                    <td className="px-3 py-3.5 font-mono text-muted-foreground hidden sm:table-cell">
                      {(inputs.filamentUsed ?? 0).toFixed(1)}g
                    </td>

                    {/* Tempo */}
                    <td className="px-3 py-3.5 font-mono text-muted-foreground whitespace-nowrap hidden md:table-cell">
                      {fmtTime(results.totalTime)}
                    </td>

                    {/* Valor total */}
                    <td className="px-3 py-3.5 font-mono font-semibold text-foreground whitespace-nowrap">
                      {fmtBRL(total, round)}
                    </td>

                    {/* Valor unit */}
                    <td className="px-3 py-3.5 font-mono text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                      {fmtBRL(unit, round)}
                    </td>

                    {/* Remover */}
                    <td className="px-3 py-3.5 text-right">
                      <button
                        onClick={() => onRemoveItem(idx)}
                        title="Remover"
                        className="w-7 h-7 rounded-md flex items-center justify-center ml-auto text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Total geral */}
        <div className="px-4 py-4 bg-secondary border-t border-border flex items-center justify-between sm:justify-end gap-4">
          <span className="text-[13px] text-muted-foreground">
            Total · {items.length} item(s)
          </span>
          <span className="text-[22px] font-semibold font-mono text-primary">
            {fmtBRL(grandTotal)}
          </span>
        </div>
      </div>

      <p className="text-[12px] text-center text-muted-foreground">
        Valores refletem as configurações individuais de cada item (arredondamento e atacado).
      </p>
    </div>
  );
};
