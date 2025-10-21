import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalculationResults, CalculatorInputs } from "@/types/calculator";
import { FileText, Download, CheckCircle2 } from "lucide-react";
import { generateQuotePDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

interface QuoteTabProps {
  results: CalculationResults | null;
  inputs: CalculatorInputs;
}

export const QuoteTab = ({ results, inputs }: QuoteTabProps) => {
  const { toast } = useToast();

  const handleGeneratePDF = () => {
    if (!results) {
      toast({
        title: "Erro",
        description: "Calcule os custos antes de gerar o orçamento",
        variant: "destructive",
      });
      return;
    }

    try {
      generateQuotePDF(inputs, results);
      toast({
        title: "PDF Gerado!",
        description: "O orçamento foi baixado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF",
        variant: "destructive",
      });
    }
  };

  if (!results) {
    return (
      <Card className="border-2">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Calcule os custos na aba "Calculadora" para gerar um orçamento</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 shadow-xl">
        <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-xl">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <CardTitle className="text-2xl">Orçamento para Cliente</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Informações da Peça */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Informações do Projeto
            </h3>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Peça</p>
                  <p className="font-semibold">{inputs.pieceName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantidade</p>
                  <p className="font-semibold">{inputs.quantity} unidade(s)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Material</p>
                  <p className="font-semibold">{inputs.material}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Complexidade</p>
                  <p className="font-semibold capitalize">
                    {inputs.complexity === 'simple' ? 'Simples' : 
                     inputs.complexity === 'intermediate' ? 'Intermediária' : 'Alta'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Resumo Financeiro */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Resumo Financeiro</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Custo de Produção:</span>
                <span className="font-medium">R$ {results.productionCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Custo por Unidade:</span>
                <span className="font-medium">R$ {results.costPerUnit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Margem de Lucro ({inputs.profitMargin}%):</span>
                <span className="font-medium text-success">R$ {results.profitAmount.toFixed(2)}</span>
              </div>
              {inputs.additionalFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa Adicional ({inputs.additionalFee}%):</span>
                  <span className="font-medium">
                    R$ {(results.finalPriceWithFee - results.finalPrice).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <Separator className="my-3" />

            <div className="bg-gradient-accent text-accent-foreground p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">PREÇO TOTAL:</span>
                <span className="text-2xl font-bold">
                  R$ {results.finalPriceWithFee.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Prazo */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Prazo de Entrega</h3>
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tempo Total Estimado:</span>
                <span className="font-semibold text-lg">
                  {Math.floor(results.totalTime)}h {Math.round((results.totalTime % 1) * 60)}min
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                ({inputs.printTimeHours}h {inputs.printTimeMinutes}min de impressão + {inputs.activeWorkTime}h de trabalho)
              </p>
            </div>
          </div>

          <Separator />

          {/* Botão de Gerar PDF */}
          <Button 
            onClick={handleGeneratePDF}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-lg py-6"
            size="lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Gerar Orçamento em PDF
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            O PDF será baixado automaticamente com todos os detalhes do orçamento
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
