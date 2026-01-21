import { useState, useEffect, type ChangeEvent } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputWithLabel } from "@/components/ui/input-with-label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { calculateCosts } from "@/utils/calculator";
import { DollarSign, TrendingUp, X, Info } from "lucide-react";

/**
 * Componente que exibe um cartão com o valor sugerido de venda, lucro líquido,
 * custo de produção e controles para ajustar a margem de lucro (markup) via
 * slider ou informar um preço final manualmente. Também permite abrir um
 * modal com o detalhamento de custos e gerar um orçamento.
 */
interface CalculationCardProps {
  /** Entradas originais da calculadora após o cálculo inicial */
  inputs: CalculatorInputs;
  /** Resultados originais do cálculo com a margem padrão */
  results: CalculationResults;
  /** Função chamada ao gerar o orçamento. Deve receber as entradas e resultados atualizados */
  onGenerateQuote: (inputs: CalculatorInputs, results: CalculationResults) => void;
  /** Função opcional para adicionar o item atual à lista de orçamento */
  onAddItemToQuote?: (inputs: CalculatorInputs, results: CalculationResults) => void;
}

export const CalculationCard = ({
  inputs,
  results,
  onGenerateQuote,
  onAddItemToQuote,
}: CalculationCardProps) => {
  // Estado local para a margem de lucro ajustável pelo slider (markup)
  const [markup, setMarkup] = useState<number>(inputs.profitMargin);

  // Estado local para preço manual. Quando undefined, usa o valor calculado automaticamente
  const [manualPrice, setManualPrice] = useState<number | undefined>(
    inputs.desiredPrice
  );

  // Estado para controlar exibição do modal de detalhamento de custos
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  // Recalcula os resultados sempre que o markup é alterado
  const [calcResults, setCalcResults] = useState<CalculationResults>(results);

  useEffect(() => {
    const updatedInputs: CalculatorInputs = {
      ...inputs,
      profitMargin: markup,
    };
    const newResults = calculateCosts(updatedInputs);
    setCalcResults(newResults);
  }, [markup, inputs]);

  // Calcula métricas para exibição. Considera o preço manual se definido
  const cost = calcResults.productionCost;

  // Valor das taxas (fee) é a diferença entre o preço final com taxa e sem taxa
  const feeValue = calcResults.finalPriceWithFee - calcResults.finalPrice;

  let finalPrice = calcResults.finalPriceWithFee;
  let profit = calcResults.profitAmount;

  // Se houver um preço manual informado, ajusta o preço final e o lucro.
  if (manualPrice !== undefined && manualPrice !== null) {
    finalPrice = manualPrice;
    profit = finalPrice - cost - feeValue;
  }

  // ROI (%) = lucro / custo * 100
  const roiPercentage = cost > 0 ? (profit / cost) * 100 : 0;

  // Margem real (%) = lucro / preço final * 100
  const realMargin = finalPrice > 0 ? (profit / finalPrice) * 100 : 0;

  // Desconto de atacado (percentual). Se não informado, assume 0.
  const wholesaleDiscount = inputs.wholesaleDiscount ?? 0;

  // Preço no atacado aplica o desconto sobre o preço final (já incluindo taxa)
  const wholesalePrice = finalPrice * (1 - wholesaleDiscount / 100);

  // Lucro líquido por unidade no atacado (seu lucro)
  const wholesaleProfit = wholesalePrice - cost - feeValue;

  // Lucro do revendedor por unidade (diferença entre preço de venda normal e preço atacado)
  const resellerProfit = finalPrice - wholesalePrice;

  // Margem de lucro do revendedor em relação ao preço de atacado
  const resellerMargin =
    wholesalePrice > 0 ? (resellerProfit / wholesalePrice) * 100 : 0;

  // Handler para alteração do slider de markup
  const handleSliderChange = (value: number[]) => {
    if (Array.isArray(value) && value.length > 0) {
      setMarkup(value[0]);
    }
  };

  // Handler para alteração do campo manual de preço
  const handleManualPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setManualPrice(undefined);
    } else {
      const num = Number(val);
      setManualPrice(isNaN(num) ? undefined : num);
    }
  };

  // Handler para gerar orçamento com os valores atuais (vai para aba orçamento / gerar pdf)
  const handleGenerateQuote = () => {
    const updatedInputs: CalculatorInputs = {
      ...inputs,
      profitMargin: markup,
      desiredPrice: manualPrice,
    };
    const updatedResults = calculateCosts(updatedInputs);
    onGenerateQuote(updatedInputs, updatedResults);
  };

  // Handler para adicionar item ao orçamento composto (multi itens)
  const handleAddItem = () => {
    const updatedInputs: CalculatorInputs = {
      ...inputs,
      profitMargin: markup,
      desiredPrice: manualPrice,
    };
    const updatedResults = calculateCosts(updatedInputs);
    if (typeof onAddItemToQuote === "function") {
      onAddItemToQuote(updatedInputs, updatedResults);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 shadow-xl">
        <CardHeader className="bg-gradient-primary text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resultado da Precificação
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3 bg-card rounded border flex flex-col justify-between">
              <div className="text-sm text-muted-foreground mb-1">
                Preço de Venda
              </div>
              <div className="text-2xl font-bold">R$ {finalPrice.toFixed(2)}</div>
              {manualPrice !== undefined && (
                <div className="text-xs text-muted-foreground">(Preço manual)</div>
              )}
            </div>

            <div className="p-3 bg-card rounded border flex flex-col justify-between">
              <div className="text-sm text-muted-foreground mb-1">Lucro Líquido</div>
              <div
                className={`text-2xl font-bold ${
                  profit < 0 ? "text-destructive" : ""
                }`}
              >
                R$ {profit.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {profit < 0 ? "Prejuízo" : `Lucro de ${realMargin.toFixed(1)}% sobre venda`}
              </div>
            </div>

            <div className="p-3 bg-card rounded border flex flex-col justify-between">
              <div className="text-sm text-muted-foreground mb-1">
                Custo de Produção
              </div>
              <div className="text-2xl font-bold">R$ {cost.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">
                Inclui falha ({inputs.failureRate}%), embalagem e extras
              </div>
            </div>

            <div className="p-3 bg-card rounded border flex flex-col justify-between">
              <div className="text-sm text-muted-foreground mb-1">Taxas / Impostos</div>
              <div className="text-2xl font-bold">R$ {feeValue.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">
                {inputs.additionalFee}% do valor de venda
              </div>
            </div>

            <div className="p-3 bg-card rounded border flex flex-col justify-between">
              <div className="text-sm text-muted-foreground mb-1">ROI (%)</div>
              <div className="text-2xl font-bold">{roiPercentage.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Retorno sobre o custo</div>
            </div>

            <div className="p-3 bg-card rounded border flex flex-col justify-between">
              <div className="text-sm text-muted-foreground mb-1">Margem Real (%)</div>
              <div className="text-2xl font-bold">{realMargin.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Lucro / Preço de Venda</div>
            </div>

            <div className="p-3 bg-card rounded border flex flex-col justify-between">
              <div className="text-sm text-muted-foreground mb-1">Preço de Atacado</div>
              <div className="text-2xl font-bold">R$ {wholesalePrice.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">
                Desconto de {wholesaleDiscount.toFixed(1)}%
              </div>
            </div>

            <div className="p-3 bg-card rounded border flex flex-col justify-between">
              <div className="text-sm text-muted-foreground mb-1">Lucro no Atacado</div>
              <div
                className={`text-2xl font-bold ${
                  wholesaleProfit < 0 ? "text-destructive" : ""
                }`}
              >
                R$ {wholesaleProfit.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {wholesaleProfit < 0 ? "Prejuízo" : "Lucro por unidade para você"}
              </div>
            </div>

            <div className="p-3 bg-card rounded border flex flex-col justify-between">
              <div className="text-sm text-muted-foreground mb-1">Margem do Revendedor</div>
              <div className="text-2xl font-bold">{resellerMargin.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">
                Lucro sobre o preço de atacado
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <Label htmlFor="markupSlider" className="flex justify-between items-center">
              <span>Markup (%)</span>
              <span className="font-semibold">{markup}%</span>
            </Label>
            <Slider
              id="markupSlider"
              min={0}
              max={500}
              step={1}
              value={[markup]}
              onValueChange={handleSliderChange}
            />
            <p className="text-xs text-muted-foreground">
              Ajuste a margem de lucro em relação ao custo de produção.
            </p>
          </div>

          <div className="space-y-1">
            <InputWithLabel
              label="Preço de Venda Manual (opcional)"
              id="manualPrice"
              type="number"
              step="0.01"
              min="0"
              value={manualPrice === undefined ? "" : manualPrice}
              onChange={handleManualPriceChange}
              placeholder="Insira um valor de venda..."
            />
            <p className="text-xs text-muted-foreground">
              Deixe em branco para usar o valor calculado.
            </p>
          </div>

          <Separator className="my-4" />

          <div className="flex flex-col md:flex-row gap-4">
            <Button
              onClick={() => setShowBreakdown(true)}
              className="flex-1 bg-gradient-accent text-accent-foreground hover:opacity-90"
            >
              <Info className="h-4 w-4 mr-2" />
              Como os gastos foram calculados
            </Button>

            <Button
              onClick={handleAddItem}
              className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Adicionar ao Orçamento
            </Button>

            <Button
              onClick={handleGenerateQuote}
              className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Gerar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {showBreakdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-card max-w-lg w-full rounded-lg shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Raio-X do Preço</h2>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowBreakdown(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Distribuição do valor de venda</p>
                <div className="flex h-4 w-full rounded overflow-hidden border">
                  <div
                    className="bg-destructive/50"
                    style={{ width: `${finalPrice > 0 ? (cost / finalPrice) * 100 : 0}%` }}
                  />
                  <div
                    className="bg-warning/50"
                    style={{ width: `${finalPrice > 0 ? (feeValue / finalPrice) * 100 : 0}%` }}
                  />
                  <div
                    className="bg-success/50"
                    style={{ width: `${finalPrice > 0 ? (profit / finalPrice) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Custo: {finalPrice > 0 ? ((cost / finalPrice) * 100).toFixed(1) : "0.0"}%</span>
                  <span>Taxas: {finalPrice > 0 ? ((feeValue / finalPrice) * 100).toFixed(1) : "0.0"}%</span>
                  <span>Lucro: {finalPrice > 0 ? ((profit / finalPrice) * 100).toFixed(1) : "0.0"}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium mb-1">1. Custo Industrial</p>

                <div className="flex justify-between text-sm">
                  <span>Material Consumido</span>
                  <span>R$ {calcResults.filamentCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Energia Elétrica</span>
                  <span>R$ {calcResults.energyCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Mão de Obra</span>
                  <span>R$ {calcResults.laborCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Manutenção</span>
                  <span>R$ {calcResults.maintenanceTotalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Acabamento</span>
                  <span>R$ {inputs.finishingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Embalagem &amp; Extras</span>
                  <span>
                    R$ {(calcResults.packagingCost + calcResults.extraCost).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Margem de Falha</span>
                  <span>R$ {calcResults.failureCost.toFixed(2)}</span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between font-semibold text-sm">
                  <span>Total Custo</span>
                  <span>R$ {cost.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium mb-1">Markup e Taxas</p>

                <div className="flex justify-between text-sm">
                  <span>Markup de {markup.toFixed(0)}%</span>
                  <span>R$ {calcResults.profitAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxa Marketplace ({inputs.additionalFee}%)</span>
                  <span>R$ {feeValue.toFixed(2)}</span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between font-semibold text-sm">
                  <span>Lucro Líquido</span>
                  <span>R$ {profit.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-right">
                <Button
                  onClick={() => setShowBreakdown(false)}
                  variant="ghost"
                  className="text-primary"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
