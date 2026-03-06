import { useState, useEffect, type ChangeEvent } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputWithLabel } from "@/components/ui/input-with-label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { calculateCosts } from "@/utils/calculator";
import { DollarSign, TrendingUp, X, Info, Package, Percent } from "lucide-react";

interface CalculationCardProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
  onGenerateQuote: (inputs: CalculatorInputs, results: CalculationResults) => void;
  onAddItemToQuote?: (inputs: CalculatorInputs, results: CalculationResults) => void;
}

export const CalculationCard = ({ inputs, results, onGenerateQuote, onAddItemToQuote }: CalculationCardProps) => {
  const [markup, setMarkup] = useState<number>(inputs.profitMargin);
  const [manualPrice, setManualPrice] = useState<number | undefined>(inputs.desiredPrice);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);
  const [useWholesaleForQuote, setUseWholesaleForQuote] = useState<boolean>(inputs.useWholesalePrice ?? false);
  
  const [calcResults, setCalcResults] = useState<CalculationResults>(results);

  useEffect(() => {
    const updatedInputs: CalculatorInputs = { ...inputs, profitMargin: markup };
    setCalcResults(calculateCosts(updatedInputs));
  }, [markup, inputs]);

  const handleSliderChange = (value: number[]) => {
    if (Array.isArray(value) && value.length > 0) setMarkup(value[0]);
  };

  const handleManualPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setManualPrice(val === "" ? undefined : (isNaN(Number(val)) ? undefined : Number(val)));
  };

  const handleAction = (actionFn: Function) => {
    const updatedInputs = { ...inputs, profitMargin: markup, desiredPrice: manualPrice, useWholesalePrice: useWholesaleForQuote };
    actionFn(updatedInputs, calculateCosts(updatedInputs));
  };

  const qty = inputs.quantity > 0 ? inputs.quantity : 1;
  const wholesaleDiscount = inputs.wholesaleDiscount ?? 0;

  // Cálculos Base Totais
  const costTotal = calcResults.productionCost;
  const feeTotal = calcResults.finalPriceWithFee - calcResults.finalPrice;
  
  let saleTotal = calcResults.finalPriceWithFee;
  let profitTotal = calcResults.profitAmount;

  if (manualPrice !== undefined && manualPrice !== null) {
    saleTotal = manualPrice;
    profitTotal = saleTotal - costTotal - feeTotal;
  }

  const realMargin = saleTotal > 0 ? (profitTotal / saleTotal) * 100 : 0;
  const wholesaleTotal = saleTotal * (1 - wholesaleDiscount / 100);
  const wholesaleProfitTotal = wholesaleTotal - costTotal - feeTotal;
  const wholesaleMargin = wholesaleTotal > 0 ? (wholesaleProfitTotal / wholesaleTotal) * 100 : 0;

  // Cálculos Por Unidade
  const costPerUnit = costTotal / qty;
  const profitPerUnit = profitTotal / qty;
  const salePerUnit = saleTotal / qty;
  const wholesalePerUnit = wholesaleTotal / qty;

  return (
    <div className="space-y-6">
      <Card className="border-2 shadow-xl">
        <CardHeader className="bg-gradient-primary text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resultado da Precificação
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          
          <div className="bg-card rounded-lg border-2 shadow-sm p-5">
            <h3 className="text-xl font-bold text-foreground mb-4 border-b pb-2 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Resumo Financeiro ({qty} {qty === 1 ? 'peça' : 'peças'})
            </h3>
            
            <div className="space-y-4">
              {/* Custo Total */}
              <div className="flex flex-col md:flex-row justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <span className="text-muted-foreground font-semibold text-sm uppercase">Custo de Produção Total</span>
                  {qty > 1 && (
                    <div className="text-sm font-medium text-muted-foreground mt-1">
                      Por unidade (R$ {costTotal.toFixed(2)} ÷ {qty}): <span className="font-bold text-foreground">R$ {costPerUnit.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="text-right mt-2 md:mt-0">
                  <span className="font-bold text-2xl">R$ {costTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Lucro Total */}
              <div className="flex flex-col md:flex-row justify-between p-4 bg-success/10 rounded-lg border border-success/20">
                <div>
                  <span className="text-success font-bold text-sm uppercase">Lucro Líquido Total</span>
                  {qty > 1 && (
                    <div className="text-sm font-medium text-success/80 mt-1">
                      Por unidade (R$ {profitTotal.toFixed(2)} ÷ {qty}): <span className="font-bold">R$ {profitPerUnit.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="text-right mt-2 md:mt-0">
                  <span className="font-bold text-2xl text-success">R$ {profitTotal.toFixed(2)}</span>
                  <div className="text-sm font-bold text-success/80 mt-1">
                    Margem: {realMargin.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Venda Total */}
              <div className="flex flex-col md:flex-row justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div>
                  <span className="text-primary font-bold text-sm uppercase">Venda Normal Total</span>
                  {qty > 1 && (
                    <div className="text-sm font-medium text-primary/80 mt-1">
                      Por unidade (R$ {saleTotal.toFixed(2)} ÷ {qty}): <span className="font-bold">R$ {salePerUnit.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="text-right mt-2 md:mt-0">
                  <span className="font-bold text-3xl text-primary">R$ {saleTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Atacado Total */}
              {wholesaleDiscount > 0 && (
                <div className="flex flex-col md:flex-row justify-between p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <div>
                    <span className="text-accent font-bold text-sm uppercase">Atacado Total ({wholesaleDiscount}% OFF)</span>
                    {qty > 1 && (
                      <div className="text-sm font-medium text-accent/80 mt-1">
                        Por unidade (R$ {wholesaleTotal.toFixed(2)} ÷ {qty}): <span className="font-bold">R$ {wholesalePerUnit.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right mt-2 md:mt-0">
                    <span className="font-bold text-2xl text-accent">R$ {wholesaleTotal.toFixed(2)}</span>
                    <div className="text-sm font-bold text-accent/80 mt-1">
                      Lucro Real: {wholesaleMargin > 0 ? `${wholesaleMargin.toFixed(1)}%` : "Prejuízo"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4 bg-muted/30 p-5 rounded-lg border border-border">
            <div className="flex justify-between items-center">
              <Label htmlFor="markupSlider" className="text-lg flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" /> Simulador de Margem de Lucro
              </Label>
              <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md font-bold text-lg shadow-sm">
                {markup}%
              </div>
            </div>
            <Slider id="markupSlider" min={0} max={500} step={1} value={[markup]} onValueChange={handleSliderChange} className="py-4 cursor-pointer" />
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="wholesaleSwitch" className="flex justify-between items-center bg-card p-4 rounded border cursor-pointer hover:bg-muted/50 transition-colors">
              <span className="font-medium">Usar preço de ATACADO ao gerar PDF / Orçamento</span>
              <Switch id="wholesaleSwitch" checked={useWholesaleForQuote} onCheckedChange={(checked) => setUseWholesaleForQuote(checked as boolean)} />
            </Label>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <Button onClick={() => setShowBreakdown(true)} variant="outline" className="flex-1 hover:bg-accent hover:text-accent-foreground border-2">
              <Info className="h-4 w-4 mr-2" /> Raio-X dos Custos
            </Button>
            <Button onClick={() => handleAction(onAddItemToQuote!)} className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-md">
              <Package className="h-4 w-4 mr-2" /> Adicionar ao Orçamento
            </Button>
            <Button onClick={() => handleAction(onGenerateQuote)} className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-md">
              <DollarSign className="h-4 w-4 mr-2" /> Gerar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* NOVO MODAL DE RAIO-X COMPLETO */}
      {showBreakdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-card max-w-lg w-full rounded-xl shadow-2xl overflow-hidden border">
            <div className="flex justify-between items-center p-5 border-b bg-muted/30">
              <h2 className="text-lg font-bold">Raio-X dos Custos do Lote</h2>
              <button className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowBreakdown(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Material Consumido</span>
                  <span className="font-medium">R$ {calcResults.filamentCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Energia Elétrica</span>
                  <span className="font-medium">R$ {calcResults.energyCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Mão de Obra e Acabamento</span>
                  <span className="font-medium">R$ {(calcResults.laborCost + (inputs.finishingCost || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Manutenção e Desgaste</span>
                  <span className="font-medium">R$ {(calcResults.maintenanceTotalCost + calcResults.wearCost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Embalagem e Extras</span>
                  <span className="font-medium">R$ {(calcResults.packagingCost + calcResults.extraCost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Margem de Falha/Perda ({inputs.failureRate || 0}%)</span>
                  <span className="font-medium">R$ {calcResults.failureCost.toFixed(2)}</span>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex justify-between font-bold text-base bg-muted/30 p-2 rounded">
                  <span>Total Custo de Produção</span>
                  <span>R$ {costTotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm mt-2 pt-2 border-t text-muted-foreground">
                  <span>Taxas de Marketplace Adicionais</span>
                  <span className="font-medium">R$ {feeTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="text-right mt-6">
                <Button onClick={() => setShowBreakdown(false)} variant="default" className="w-full">Fechar Raio-X</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};