import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { Trash2, Download, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export const QuoteTab = ({ items, onRemoveItem, onClearItems, onGeneratePDF }: QuoteTabProps) => {
  const { toast } = useToast();

  const grandTotal = items.reduce(
    (acc, item) =>
      acc +
      (item.inputs.roundPrice
        ? Math.round(item.results.finalPriceWithFee)
        : item.results.finalPriceWithFee),
    0
  );

  const handleGenerate = () => {
    if (items.length === 0) {
      toast({
        title: "Nenhum item",
        description: "Adicione itens ao orçamento antes de gerar o PDF.",
        variant: "destructive",
      });
      return;
    }
    try {
      onGeneratePDF(items);
      toast({
        title: "PDF Gerado!",
        description: "O orçamento foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-2 shadow-xl">
      <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-xl">
        <CardTitle className="text-2xl">Orçamento</CardTitle>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-center">
            Nenhum item adicionado ao orçamento. Adicione itens na aba Calculadora.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-primary text-primary-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase">Qtd.</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase">Descrição</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase">Material</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase">Peso (g)</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase">Tempo (h:m)</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase">Pintura</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase">Valor total</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase">Valor unid.</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>

                <tbody className="bg-card divide-y divide-gray-200">
                  {items.map((item, idx) => {
                    const inputs = item.inputs;
                    const results = item.results;

                    const qty = Math.max(1, Number(inputs.quantity) || 1);
                    const round = inputs.roundPrice;

                    const totalPriceRaw = Number(results.finalPriceWithFee) || 0;
                    const totalPrice = round ? Math.round(totalPriceRaw) : totalPriceRaw;

                    const unitPrice = totalPrice / qty;

                    const totalHours = Number(results.totalTime) || 0;
                    const hours = Math.floor(totalHours);
                    const minutes = Math.round((totalHours - hours) * 60);
                    const timeStr = `${hours}h ${minutes}m`;

                    return (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-muted/50" : "bg-muted"}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">{qty}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">{inputs.pieceName}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">{inputs.material}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {inputs.filamentUsed?.toFixed(2) || 0}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">{timeStr}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {inputs.manualPainting ? "Sim" : "Não"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          R$ {round ? totalPrice.toFixed(0) : totalPrice.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          R$ {round ? Math.round(unitPrice).toFixed(0) : unitPrice.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => onRemoveItem(idx)}
                            title="Remover item"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end items-center mt-4">
              <span className="font-semibold mr-2">Total Geral:</span>
              <span className="text-xl font-bold">R$ {grandTotal.toFixed(2)}</span>
            </div>
          </>
        )}

        <Separator />

        <div className="space-y-3">
          <Button
            onClick={handleGenerate}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-lg py-6"
            disabled={items.length === 0}
          >
            <Download className="mr-2 h-5 w-5" /> Gerar Orçamento em PDF
          </Button>

          <Button
            onClick={() => {
              if (items.length === 0) {
                toast({
                  title: "Nenhum item",
                  description: "Não há itens para limpar.",
                  variant: "destructive",
                });
                return;
              }
              onClearItems();
              toast({ title: "Orçamento limpo", description: "Todos os itens foram removidos." });
            }}
            className="w-full bg-gradient-accent hover:opacity-90 transition-opacity text-lg py-6"
          >
            <Trash2 className="mr-2 h-5 w-5" /> Limpar Orçamento
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Os itens adicionados aqui serão incluídos no PDF com seus valores totais e unitários.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
