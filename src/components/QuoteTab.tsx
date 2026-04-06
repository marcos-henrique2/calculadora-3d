import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { formatBRL } from "@/utils/calculator";
import { useToast } from "@/hooks/use-toast";
import {
  Trash2,
  Download,
  X,
  Package,
  FileText,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type QuoteItem = {
  inputs: CalculatorInputs;
  results: CalculationResults;
};

interface QuoteTabProps {
  items: QuoteItem[];
  onRemoveItem: (index: number) => void;
  onClearItems: () => void;
  onGeneratePDF: (items: QuoteItem[]) => void;
}

export const QuoteTab = ({
  items,
  onRemoveItem,
  onClearItems,
  onGeneratePDF,
}: QuoteTabProps) => {
  const { toast } = useToast();
  const [confirmClear, setConfirmClear] = useState(false);

  const grandTotal = items.reduce((acc, item) => {
    const { inputs, results } = item;
    const qty = Math.max(1, Number(inputs.quantity) || 1);
    const useWholesale =
      !!inputs.useWholesalePrice && (inputs.wholesaleDiscount ?? 0) > 0;
    const priceRaw = useWholesale
      ? results.wholesalePrice
      : results.finalPriceWithFee;
    const totalPrice = inputs.roundPrice ? Math.round(priceRaw) : priceRaw;
    return acc + totalPrice;
  }, 0);

  const handleGenerate = () => {
    if (items.length === 0) {
      toast({
        title: "Orçamento vazio",
        description: "Adicione itens antes de gerar o PDF.",
        variant: "destructive",
      });
      return;
    }
    try {
      onGeneratePDF(items);
      toast({
        title: "PDF gerado com sucesso!",
        description: `${items.length} item(s) incluídos no orçamento.`,
      });
    } catch {
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente.",
        variant: "destructive",
      });
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
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <ShoppingCart className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-base font-medium text-foreground">
            Nenhum item no orçamento
          </h3>
          <p className="text-sm text-muted-foreground mt-1 text-balance">
            Calcule um item na aba Calculadora e clique em{" "}
            <strong>"Adicionar ao orçamento"</strong> para começar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h2 className="text-base font-medium">Itens do orçamento</h2>
          <Badge variant="secondary" className="font-mono">
            {items.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className={cn(
              "h-8 text-xs transition-colors",
              confirmClear
                ? "border-destructive text-destructive hover:bg-destructive/10"
                : ""
            )}
          >
            {confirmClear ? (
              <>
                <AlertCircle className="w-3 h-3 mr-1.5" />
                Confirmar limpeza
              </>
            ) : (
              <>
                <Trash2 className="w-3 h-3 mr-1.5" />
                Limpar
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleGenerate}
            className="h-8 text-xs bg-primary hover:bg-primary/90 shadow-sm"
          >
            <Download className="w-3 h-3 mr-1.5" />
            Gerar PDF
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {[
                  { label: "Qtd.", align: "left" },
                  { label: "Descrição", align: "left" },
                  { label: "Material", align: "left" },
                  { label: "Peso", align: "right" },
                  { label: "Tempo", align: "right" },
                  { label: "Valor total", align: "right" },
                  { label: "Valor unit.", align: "right" },
                  { label: "", align: "right" },
                ].map((col) => (
                  <th
                    key={col.label}
                    className={cn(
                      "px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap",
                      col.align === "right" ? "text-right" : "text-left"
                    )}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const { inputs, results } = item;
                const qty = Math.max(1, Number(inputs.quantity) || 1);
                const round = inputs.roundPrice;
                const useWholesale =
                  !!inputs.useWholesalePrice &&
                  (inputs.wholesaleDiscount ?? 0) > 0;
                const priceRaw = useWholesale
                  ? results.wholesalePrice
                  : results.finalPriceWithFee;
                const totalPrice = round ? Math.round(priceRaw) : priceRaw;
                const unitPrice = totalPrice / qty;

                const totalH = Math.floor(results.totalTime);
                const totalM = Math.round((results.totalTime - totalH) * 60);

                return (
                  <tr
                    key={idx}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-medium text-foreground">
                        {qty}×
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        {(inputs as any).productImage ? (
                          <img
                            src={(inputs as any).productImage}
                            alt=""
                            className="w-8 h-8 rounded-md object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                            <Package className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground truncate max-w-[180px]">
                            {inputs.pieceName}
                          </p>
                          {inputs.clientName && (
                            <p className="text-xs text-muted-foreground">
                              {inputs.clientName}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant="outline"
                        className="text-xs font-normal"
                      >
                        {inputs.material}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-muted-foreground">
                      {(inputs.filamentUsed ?? 0).toFixed(1)}g
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-muted-foreground whitespace-nowrap">
                      {totalH}h {totalM}m
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-foreground">
                      {formatBRL(totalPrice, round)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-muted-foreground">
                      {formatBRL(unitPrice, round)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => onRemoveItem(idx)}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-auto"
                        title="Remover"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="px-4 py-4 bg-muted/30 border-t border-border">
          <div className="flex items-center justify-end gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              Total geral ({items.length} item{items.length > 1 ? "s" : ""})
            </span>
            <span className="text-2xl font-semibold font-mono text-primary">
              {formatBRL(grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <p className="text-xs text-center text-muted-foreground">
        Os preços exibidos refletem as configurações de cada item (atacado/arredondamento).
        O PDF conterá todos os detalhes de cada peça.
      </p>
    </div>
  );
};