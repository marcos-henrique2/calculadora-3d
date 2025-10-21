import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalculationResults, CalculatorInputs } from "@/types/calculator";
import { DollarSign, Clock, TrendingUp, AlertCircle, Calculator, Target, Package } from "lucide-react";

interface ResultsDisplayProps {
  results: CalculationResults | null;
  inputs: CalculatorInputs;
}

export const ResultsDisplay = ({ results, inputs }: ResultsDisplayProps) => {
  if (!results) {
    return (
      <Card className="border-2">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Preencha os campos e clique em "Calcular" para ver os resultados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const costBreakdown = [
    { label: "Filamento", value: results.filamentCost, icon: DollarSign },
    { label: "Energia Elétrica", value: results.energyCost, icon: DollarSign },
    { label: "Desgaste da Impressora", value: results.wearCost, icon: DollarSign },
    { label: "Mão de Obra", value: results.laborCost, icon: DollarSign },
    { label: "Manutenção", value: results.maintenanceTotalCost, icon: DollarSign },
    { label: "Acabamento", value: inputs.finishingCost, icon: DollarSign },
    { label: "Margem de Falha", value: results.failureCost, icon: AlertCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Cards de Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-primary text-primary-foreground border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Custo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {results.productionCost.toFixed(2)}
            </div>
            <p className="text-xs opacity-80 mt-1">
              R$ {results.costPerUnit.toFixed(2)} por unidade
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-accent text-accent-foreground border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Margem de Lucro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {results.profitAmount.toFixed(2)}
            </div>
            <p className="text-xs opacity-80 mt-1">
              {inputs.profitMargin}% sobre o custo
            </p>
          </CardContent>
        </Card>

        <Card className="bg-success text-success-foreground border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Preço Final
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {results.finalPriceWithFee.toFixed(2)}
            </div>
            <p className="text-xs opacity-80 mt-1">
              {inputs.additionalFee > 0 ? `Com ${inputs.additionalFee}% de taxa` : 'Sem taxas adicionais'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tempo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(results.totalTime)}h {Math.round((results.totalTime % 1) * 60)}min
            </div>
            <p className="text-xs opacity-80 mt-1">
              {inputs.printTimeHours}h {inputs.printTimeMinutes}min impressão + {inputs.activeWorkTime}h trabalho
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ROI - Retorno sobre Investimento */}
      <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="bg-gradient-primary text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Retorno sobre Investimento (ROI)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Peças necessárias para recuperar investimento */}
            <div className="text-center p-4 bg-card rounded-lg border-2">
              <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold text-primary mb-1">
                {Math.ceil(inputs.printerValue / results.profitAmount)}
              </div>
              <p className="text-sm text-muted-foreground">
                Peças necessárias para recuperar investimento da impressora
              </p>
            </div>

            {/* Tempo para recuperar (estimativa 30 peças/mês) */}
            <div className="text-center p-4 bg-card rounded-lg border-2">
              <Clock className="h-8 w-8 mx-auto mb-2 text-accent" />
              <div className="text-3xl font-bold text-accent mb-1">
                {(Math.ceil(inputs.printerValue / results.profitAmount) / 30).toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">
                Meses para recuperar investimento (estimativa: 30 peças/mês)
              </p>
            </div>

            {/* Lucro mensal estimado */}
            <div className="text-center p-4 bg-card rounded-lg border-2">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-success" />
              <div className="text-3xl font-bold text-success mb-1">
                R$ {(results.profitAmount * 30).toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">
                Lucro líquido mensal estimado (30 peças/mês)
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valor da impressora:</span>
              <span className="font-semibold">R$ {inputs.printerValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Lucro líquido por peça:</span>
              <span className="font-semibold text-success">R$ {results.profitAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ROI percentual:</span>
              <span className="font-semibold text-primary">
                {((results.profitAmount / inputs.printerValue) * 100).toFixed(2)}% por peça
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-xs text-center text-muted-foreground">
              💡 <strong>Dica:</strong> Os cálculos consideram uma média de 30 peças por mês. 
              Ajuste sua produção e margem de lucro para atingir seus objetivos financeiros.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detalhamento de Custos */}
      <Card className="border-2">
        <CardHeader className="bg-secondary">
          <CardTitle>Detalhamento de Custos</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {costBreakdown.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="font-semibold">R$ {item.value.toFixed(2)}</span>
                  </div>
                  {index < costBreakdown.length - 1 && <Separator className="mt-3" />}
                </div>
              );
            })}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span>Multiplicador de Complexidade:</span>
              <span className="font-semibold">×{results.complexityMultiplier.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Complexidade:</span>
              <span className="font-semibold capitalize">
                {inputs.complexity === 'simple' ? 'Simples' : 
                 inputs.complexity === 'intermediate' ? 'Intermediária' : 'Alta'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
