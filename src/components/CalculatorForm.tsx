import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputWithLabel } from "@/components/ui/input-with-label";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calculator, Package, Zap, Wrench, TrendingUp } from "lucide-react";
import { CalculatorInputs } from "@/types/calculator";

interface CalculatorFormProps {
  inputs: CalculatorInputs;
  setInputs: (inputs: CalculatorInputs) => void;
  onCalculate: () => void;
}

/**
 * Formulário principal da calculadora de custos.
 * Todos os campos numéricos foram ajustados para permitir que o usuário apague
 * completamente o valor atual sem que o número “0” apareça imediatamente. Se o
 * campo estiver vazio, o valor interno é salvo como 0; caso contrário, o
 * texto digitado é convertido para número. Essa abordagem facilita a edição
 * utilizando apenas a tecla Backspace.
 */
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
          {/* Campo Nome do Cliente */}
          <InputWithLabel
            label="Nome do Cliente"
            id="clientName"
            value={inputs.clientName || ""}
            onChange={(e) => handleInputChange("clientName", e.target.value)}
            placeholder="Ex: João Silva"
          />

          <InputWithLabel
            label="Nome/Descrição da Peça"
            id="pieceName"
            value={inputs.pieceName}
            onChange={(e) => handleInputChange("pieceName", e.target.value)}
            placeholder="Ex: Suporte para celular"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWithLabel
              label="Quantidade"
              id="quantity"
              type="number"
              min="1"
              value={inputs.quantity === 0 ? "" : inputs.quantity}
              onChange={(e) => handleInputChange("quantity", e.target.value === "" ? 0 : Number(e.target.value))}
            />
            <InputWithLabel
              label="Material Utilizado"
              id="material"
              value={inputs.material}
              onChange={(e) => handleInputChange("material", e.target.value)}
              placeholder="Ex: PLA, ABS, PETG"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="manualPainting"
              checked={inputs.manualPainting}
              onCheckedChange={(checked) => handleInputChange("manualPainting", checked as boolean)}
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
              value={inputs.filamentPrice === 0 ? "" : inputs.filamentPrice}
              onChange={(e) =>
                handleInputChange(
                  "filamentPrice",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
            />
            <InputWithLabel
              label="Filamento Usado (g)"
              id="filamentUsed"
              type="number"
              step="0.1"
              min="0"
              value={inputs.filamentUsed === 0 ? "" : inputs.filamentUsed}
              onChange={(e) =>
                handleInputChange(
                  "filamentUsed",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Tempo de Impressão</Label>
            <div className="grid grid-cols-2 gap-4">
              <InputWithLabel
                label="Horas"
                id="printTimeHours"
                type="number"
                min="0"
                value={inputs.printTimeHours === 0 ? "" : inputs.printTimeHours}
                onChange={(e) =>
                  handleInputChange(
                    "printTimeHours",
                    e.target.value === "" ? 0 : Number(e.target.value)
                  )
                }
              />
              <InputWithLabel
                label="Minutos"
                id="printTimeMinutes"
                type="number"
                min="0"
                max="59"
                value={inputs.printTimeMinutes === 0 ? "" : inputs.printTimeMinutes}
                onChange={(e) =>
                  handleInputChange(
                    "printTimeMinutes",
                    e.target.value === "" ? 0 : Number(e.target.value)
                  )
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWithLabel
              label="Potência da Impressora (W)"
              id="printerPower"
              type="number"
              min="0"
              value={inputs.printerPower === 0 ? "" : inputs.printerPower}
              onChange={(e) =>
                handleInputChange(
                  "printerPower",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
            />
            <InputWithLabel
              label="Tarifa de Energia (R$/kWh)"
              id="energyRate"
              type="number"
              step="0.01"
              min="0"
              value={inputs.energyRate === 0 ? "" : inputs.energyRate}
              onChange={(e) =>
                handleInputChange(
                  "energyRate",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
            />
            <InputWithLabel
              label="Valor da Impressora (R$)"
              id="printerValue"
              type="number"
              step="0.01"
              min="0"
              value={inputs.printerValue === 0 ? "" : inputs.printerValue}
              onChange={(e) =>
                handleInputChange(
                  "printerValue",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
            />
            <InputWithLabel
              label="Vida Útil da Impressora (h)"
              id="printerLifespan"
              type="number"
              min="1"
              value={inputs.printerLifespan === 0 ? "" : inputs.printerLifespan}
              onChange={(e) =>
                handleInputChange(
                  "printerLifespan",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
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
              value={inputs.hourlyRate === 0 ? "" : inputs.hourlyRate}
              onChange={(e) =>
                handleInputChange(
                  "hourlyRate",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
            />
            <InputWithLabel
              label="Tempo de Trabalho Ativo (h)"
              id="activeWorkTime"
              type="number"
              step="0.1"
              min="0"
              value={inputs.activeWorkTime === 0 ? "" : inputs.activeWorkTime}
              onChange={(e) =>
                handleInputChange(
                  "activeWorkTime",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
            />
            <InputWithLabel
              label="Custo de Acabamento (R$)"
              id="finishingCost"
              type="number"
              step="0.01"
              min="0"
              value={inputs.finishingCost === 0 ? "" : inputs.finishingCost}
              onChange={(e) =>
                handleInputChange(
                  "finishingCost",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
            />
            <InputWithLabel
              label="Custo de Manutenção (R$/h)"
              id="maintenanceCost"
              type="number"
              step="0.01"
              min="0"
              value={inputs.maintenanceCost === 0 ? "" : inputs.maintenanceCost}
              onChange={(e) =>
                handleInputChange(
                  "maintenanceCost",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
            />
            <InputWithLabel
              label="Taxa de Falha (%)"
              id="failureRate"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={inputs.failureRate === 0 ? "" : inputs.failureRate}
              onChange={(e) =>
                handleInputChange(
                  "failureRate",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
            />
            {/* Novos custos adicionais */}
            <InputWithLabel
              label="Custo de Embalagem (R$)"
              id="packagingCost"
              type="number"
              step="0.01"
              min="0"
              value={inputs.packagingCost === undefined ? "" : inputs.packagingCost}
              onChange={(e) =>
                handleInputChange(
                  "packagingCost",
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
            />
            <InputWithLabel
              label="Custos Extras (R$)"
              id="extraCost"
              type="number"
              step="0.01"
              min="0"
              value={inputs.extraCost === undefined ? "" : inputs.extraCost}
              onChange={(e) =>
                handleInputChange(
                  "extraCost",
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
            />
            <div className="space-y-2">
              <Label htmlFor="complexity">Complexidade da Peça</Label>
              <Select value={inputs.complexity} onValueChange={(value) => handleInputChange("complexity", value)}>
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
              value={inputs.profitMargin === 0 ? "" : inputs.profitMargin}
              onChange={(e) =>
                handleInputChange(
                  "profitMargin",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
            />
            <InputWithLabel
              label="Taxa Adicional - Marketplace (% opcional)"
              id="additionalFee"
              type="number"
              step="0.1"
              min="0"
              value={inputs.additionalFee === 0 ? "" : inputs.additionalFee}
              onChange={(e) =>
                handleInputChange(
                  "additionalFee",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
              placeholder="Ex: 12% Shopee, 5% Etsy"
            />
            {/* Desconto de atacado */}
            <InputWithLabel
              label="Desconto de Atacado (%)"
              id="wholesaleDiscount"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={inputs.wholesaleDiscount === undefined ? "" : inputs.wholesaleDiscount}
              onChange={(e) =>
                handleInputChange(
                  "wholesaleDiscount",
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
              placeholder="Ex: 20 para dar 20% de desconto"
            />
          </div>
          <div className="pt-2">
            <InputWithLabel
              label="Preço que Deseja Cobrar (R$ - opcional)"
              id="desiredPrice"
              type="number"
              step="0.01"
              min="0"
              value={inputs.desiredPrice || ""}
              onChange={(e) =>
                handleInputChange(
                  "desiredPrice",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="Deixe vazio para usar o preço calculado"
            />
            <p className="text-xs text-muted-foreground mt-2">
              💡 Preencha para comparar seu preço com o valor sugerido pelo cálculo
            </p>
          </div>

          {/* Opção para arredondar o preço final */}
          <div className="pt-4 flex items-center space-x-2">
            <Checkbox
              id="roundPrice"
              checked={!!inputs.roundPrice}
              onCheckedChange={(checked) =>
                handleInputChange("roundPrice", !!checked)
              }
            />
            <Label htmlFor="roundPrice" className="cursor-pointer">
              Arredondar preço final (valor inteiro)
            </Label>
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