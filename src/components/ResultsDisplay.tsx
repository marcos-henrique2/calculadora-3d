import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalculationResults, CalculatorInputs } from "@/types/calculator";
import { DollarSign, Clock, TrendingUp, AlertCircle, Calculator } from "lucide-react";

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
              {results.totalTime.toFixed(1)}h
            </div>
            <p className="text-xs opacity-80 mt-1">
              {inputs.printTime}h impressão + {inputs.activeWorkTime}h trabalho
            </p>
          </CardContent>
        </Card>
      </div>

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
