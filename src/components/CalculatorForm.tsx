import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputWithLabel } from "@/components/ui/input-with-label";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calculator, Package, Zap, Wrench, TrendingUp, DollarSign } from "lucide-react";
import { CalculatorInputs } from "@/types/calculator";

interface CalculatorFormProps {
  inputs: CalculatorInputs;
  setInputs: (inputs: CalculatorInputs) => void;
  onCalculate: () => void;
}

export const CalculatorForm = ({ inputs, setInputs, onCalculate }: CalculatorFormProps) => {
  const handleInputChange = (field: keyof CalculatorInputs, value: string | number | boolean) => {
    setInputs({ ...inputs, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Dados da Peça */}
      <Card className="border-2 hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-xl">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <CardTitle>Dados da Peça</CardTitle>
          </div>
          <CardDescription className="text-primary-foreground/80">
            Informações básicas sobre o item a ser impresso
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <InputWithLabel
            label="Nome/Descrição da Peça"
            id="pieceName"
            value={inputs.pieceName}
            onChange={(e) => handleInputChange('pieceName', e.target.value)}
            placeholder="Ex: Suporte para celular"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWithLabel
              label="Quantidade"
              id="quantity"
              type="number"
              min="1"
              value={inputs.quantity}
              onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
            />
            <InputWithLabel
              label="Material Utilizado"
              id="material"
              value={inputs.material}
              onChange={(e) => handleInputChange('material', e.target.value)}
              placeholder="Ex: PLA, ABS, PETG"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="manualPainting"
              checked={inputs.manualPainting}
              onCheckedChange={(checked) => handleInputChange('manualPainting', checked as boolean)}
            />
            <Label htmlFor="manualPainting" className="cursor-pointer">
              Pintura manual necessária
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Parâmetros da Impressão */}
      <Card className="border-2 hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-accent text-accent-foreground rounded-t-xl">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <CardTitle>Parâmetros da Impressão</CardTitle>
          </div>
          <CardDescription className="text-accent-foreground/80">
            Configurações técnicas e custos operacionais
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWithLabel
              label="Preço do Filamento (R$/kg)"
              id="filamentPrice"
              type="number"
              step="0.01"
              min="0"
              value={inputs.filamentPrice}
              onChange={(e) => handleInputChange('filamentPrice', Number(e.target.value))}
            />
            <InputWithLabel
              label="Filamento Usado (g)"
              id="filamentUsed"
              type="number"
              step="0.1"
              min="0"
              value={inputs.filamentUsed}
              onChange={(e) => handleInputChange('filamentUsed', Number(e.target.value))}
            />
            <InputWithLabel
              label="Tempo de Impressão (h)"
              id="printTime"
              type="number"
              step="0.1"
              min="0"
              value={inputs.printTime}
              onChange={(e) => handleInputChange('printTime', Number(e.target.value))}
            />
            <InputWithLabel
              label="Potência da Impressora (W)"
              id="printerPower"
              type="number"
              min="0"
              value={inputs.printerPower}
              onChange={(e) => handleInputChange('printerPower', Number(e.target.value))}
            />
            <InputWithLabel
              label="Tarifa de Energia (R$/kWh)"
              id="energyRate"
              type="number"
              step="0.01"
              min="0"
              value={inputs.energyRate}
              onChange={(e) => handleInputChange('energyRate', Number(e.target.value))}
            />
            <InputWithLabel
              label="Valor da Impressora (R$)"
              id="printerValue"
              type="number"
              step="0.01"
              min="0"
              value={inputs.printerValue}
              onChange={(e) => handleInputChange('printerValue', Number(e.target.value))}
            />
            <InputWithLabel
              label="Vida Útil da Impressora (h)"
              id="printerLifespan"
              type="number"
              min="1"
              value={inputs.printerLifespan}
              onChange={(e) => handleInputChange('printerLifespan', Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Trabalho e Estratégia */}
      <Card className="border-2 hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-xl">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            <CardTitle>Trabalho e Estratégia</CardTitle>
          </div>
          <CardDescription className="text-primary-foreground/80">
            Custos de mão de obra e ajustes estratégicos
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWithLabel
              label="Valor da Hora de Trabalho (R$/h)"
              id="hourlyRate"
              type="number"
              step="0.01"
              min="0"
              value={inputs.hourlyRate}
              onChange={(e) => handleInputChange('hourlyRate', Number(e.target.value))}
            />
            <InputWithLabel
              label="Tempo de Trabalho Ativo (h)"
              id="activeWorkTime"
              type="number"
              step="0.1"
              min="0"
              value={inputs.activeWorkTime}
              onChange={(e) => handleInputChange('activeWorkTime', Number(e.target.value))}
            />
            <InputWithLabel
              label="Custo de Acabamento (R$)"
              id="finishingCost"
              type="number"
              step="0.01"
              min="0"
              value={inputs.finishingCost}
              onChange={(e) => handleInputChange('finishingCost', Number(e.target.value))}
            />
            <InputWithLabel
              label="Custo de Manutenção (R$/h)"
              id="maintenanceCost"
              type="number"
              step="0.01"
              min="0"
              value={inputs.maintenanceCost}
              onChange={(e) => handleInputChange('maintenanceCost', Number(e.target.value))}
            />
            <InputWithLabel
              label="Taxa de Falha (%)"
              id="failureRate"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={inputs.failureRate}
              onChange={(e) => handleInputChange('failureRate', Number(e.target.value))}
            />
            <div className="space-y-2">
              <Label htmlFor="complexity">Complexidade da Peça</Label>
              <Select value={inputs.complexity} onValueChange={(value) => handleInputChange('complexity', value)}>
                <SelectTrigger id="complexity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simples (×1.0)</SelectItem>
                  <SelectItem value="intermediate">Intermediária (×1.15)</SelectItem>
                  <SelectItem value="high">Alta (×1.35)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Margens e Taxas */}
      <Card className="border-2 hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-accent text-accent-foreground rounded-t-xl">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <CardTitle>Margens e Taxas</CardTitle>
          </div>
          <CardDescription className="text-accent-foreground/80">
            Configure sua margem de lucro e taxas adicionais
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWithLabel
              label="Margem de Lucro (%)"
              id="profitMargin"
              type="number"
              step="0.1"
              min="0"
              value={inputs.profitMargin}
              onChange={(e) => handleInputChange('profitMargin', Number(e.target.value))}
            />
            <InputWithLabel
              label="Taxa Adicional - Marketplace (% opcional)"
              id="additionalFee"
              type="number"
              step="0.1"
              min="0"
              value={inputs.additionalFee}
              onChange={(e) => handleInputChange('additionalFee', Number(e.target.value))}
              placeholder="Ex: 12% Shopee, 5% Etsy"
            />
          </div>
        </CardContent>
      </Card>

      {/* Botão Calcular */}
      <Button 
        onClick={onCalculate}
        className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-lg py-6"
        size="lg"
      >
        <Calculator className="mr-2 h-5 w-5" />
        Calcular Custos
      </Button>
    </div>
  );
};
