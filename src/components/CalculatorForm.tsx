import { ChangeEvent, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputWithLabel } from "@/components/ui/input-with-label";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calculator, Package, Zap, Wrench, TrendingUp, Image as ImageIcon } from "lucide-react";
import { CalculatorInputs } from "@/types/calculator";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { calculatorSchema } from "@/utils/validation";

interface CalculatorFormProps {
  /**
   * Objeto contendo todos os valores de entrada da calculadora. Qualquer
   * alteração em um dos campos deve atualizar este objeto através de
   * `setInputs`, garantindo que o estado global permaneça consistente.
   */
  inputs: CalculatorInputs;
  /**
   * Função para atualizar o estado de entrada. Recebe o novo objeto de
   * entradas e substitui o estado atual.
   */
  setInputs: (inputs: CalculatorInputs) => void;
  /**
   * Callback invocado quando o usuário clica no botão "Calcular Custos".
   */
  onCalculate: () => void;
}

/**
 * Formulário principal da calculadora de custos.
 *
 * Este componente foi adaptado para incluir um campo de upload de imagem
 * permitindo ao usuário selecionar uma foto do produto. A imagem é lida
 * como Data URL via FileReader e armazenada em `inputs.productImage`. A
 * foto será usada posteriormente na lista de orçamento e no PDF.
 */
export const CalculatorForm = ({ inputs, setInputs, onCalculate }: CalculatorFormProps) => {
  const { register, handleSubmit, watch, setValue, reset, control, formState: { errors } } = useForm<CalculatorInputs>({
    resolver: zodResolver(calculatorSchema as any),
    defaultValues: inputs,
    mode: 'onBlur',
  });

  // Sincroniza o estado interno do form com o estado pai `inputs`
  useEffect(() => {
    const subscription = watch((value) => {
      if (value) setInputs(value as CalculatorInputs);
    });
    return () => subscription.unsubscribe();
  }, [watch, setInputs]);

  useEffect(() => {
    // Se o objeto `inputs` pai mudar (ex: carregar orçamento), reset no form
    reset(inputs);
  }, [inputs, reset]);

  /**
   * Manipula a seleção de uma imagem de produto. Lê o arquivo como Data URL
   * usando FileReader e armazena o resultado em `inputs.productImage`.
   * Caso nenhum arquivo seja selecionado, define `productImage` como
   * undefined para limpar a imagem.
   */
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setValue('productImage' as any, undefined as any);
      setInputs({ ...(inputs as any), productImage: undefined } as any);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result?.toString();
      setValue('productImage' as any, base64 as any);
      setInputs({ ...(inputs as any), productImage: base64 || undefined } as any);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: CalculatorInputs) => {
    setInputs(data);
    onCalculate();
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
            placeholder="Ex: João Silva"
            error={errors.clientName?.message as any}
            {...register('clientName')}
          />

          <InputWithLabel
            label="Nome/Descrição da Peça"
            id="pieceName"
            placeholder="Ex: Suporte para celular"
            error={errors.pieceName?.message as any}
            {...register('pieceName')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWithLabel
              label="Quantidade"
              id="quantity"
              type="number"
              min="1"
              error={errors.quantity?.message as any}
              {...register('quantity', { valueAsNumber: true })}
            />
            <InputWithLabel
              label="Material Utilizado"
              id="material"
              placeholder="Ex: PLA, ABS, PETG"
              error={errors.material?.message as any}
              {...register('material')}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Controller
              control={control}
              name="manualPainting"
              render={({ field }) => (
                <>
                  <Checkbox id="manualPainting" checked={!!field.value} onCheckedChange={(val) => field.onChange(!!val)} />
                  <Label htmlFor="manualPainting" className="cursor-pointer">
                    Pintura manual necessária
                  </Label>
                </>
              )}
            />
          </div>
          {/* Campo de upload de foto do produto */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="productImage" className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4" /> Foto do Produto
            </Label>
            <input
              id="productImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border rounded p-1 text-sm"
            />
            {/* Pré-visualização da imagem. Cast para any pois alguns projetos antigos não declaram productImage em CalculatorInputs */}
            {(() => {
              const img: string | undefined = (watch() as any).productImage || (inputs as any).productImage;
              if (img) {
                return (
                  <div className="mt-2">
                    <img
                      src={img}
                      alt="Pré-visualização da foto do produto"
                      className="h-20 w-20 object-cover rounded border"
                    />
                  </div>
                );
              }
              return null;
            })()}
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
              {...register('filamentPrice', { valueAsNumber: true })}
            />
            <InputWithLabel
              label="Filamento Usado (g)"
              id="filamentUsed"
              type="number"
              step="0.1"
              min="0"
              {...register('filamentUsed', { valueAsNumber: true })}
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
                {...register('printTimeHours', { valueAsNumber: true })}
              />
              <InputWithLabel
                label="Minutos"
                id="printTimeMinutes"
                type="number"
                min="0"
                max="59"
                {...register('printTimeMinutes', { valueAsNumber: true })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWithLabel
              label="Potência da Impressora (W)"
              id="printerPower"
              type="number"
              min="0"
              {...register('printerPower', { valueAsNumber: true })}
            />
            <InputWithLabel
              label="Tarifa de Energia (R$/kWh)"
              id="energyRate"
              type="number"
              step="0.01"
              min="0"
              {...register('energyRate', { valueAsNumber: true })}
            />
            <InputWithLabel
              label="Valor da Impressora (R$)"
              id="printerValue"
              type="number"
              step="0.01"
              min="0"
              {...register('printerValue', { valueAsNumber: true })}
            />
            <InputWithLabel
              label="Vida Útil da Impressora (h)"
              id="printerLifespan"
              type="number"
              min="1"
              {...register('printerLifespan', { valueAsNumber: true })}
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
              {...register('hourlyRate', { valueAsNumber: true })}
              error={errors.hourlyRate?.message as any}
            />
            <InputWithLabel
              label="Tempo de Trabalho Ativo (h)"
              id="activeWorkTime"
              type="number"
              step="0.1"
              min="0"
              {...register('activeWorkTime', { valueAsNumber: true })}
            />
            <InputWithLabel
              label="Custo de Acabamento (R$)"
              id="finishingCost"
              type="number"
              step="0.01"
              min="0"
              {...register('finishingCost', { valueAsNumber: true })}
            />
            <InputWithLabel
              label="Custo de Manutenção (R$/h)"
              id="maintenanceCost"
              type="number"
              step="0.01"
              min="0"
              {...register('maintenanceCost', { valueAsNumber: true })}
            />
            <InputWithLabel
              label="Taxa de Falha (%)"
              id="failureRate"
              type="number"
              step="0.1"
              min="0"
              max="100"
              {...register('failureRate', { valueAsNumber: true })}
            />
            {/* Novos custos adicionais */}
            <InputWithLabel
              label="Custo de Embalagem (R$)"
              id="packagingCost"
              type="number"
              step="0.01"
              min="0"
              {...register('packagingCost', { valueAsNumber: true })}
            />
            <InputWithLabel
              label="Custos Extras (R$)"
              id="extraCost"
              type="number"
              step="0.01"
              min="0"
              {...register('extraCost', { valueAsNumber: true })}
            />
            <div className="space-y-2">
              <Label htmlFor="complexity">Complexidade da Peça</Label>
              <Controller
                control={control}
                name="complexity"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="complexity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simples (×1.0)</SelectItem>
                      <SelectItem value="intermediate">Intermediária (×1.15)</SelectItem>
                      <SelectItem value="high">Alta (×1.35)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
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
              {...register('profitMargin', { valueAsNumber: true })}
            />
            <InputWithLabel
              label="Taxa Adicional - Marketplace (% opcional)"
              id="additionalFee"
              type="number"
              step="0.1"
              min="0"
              {...register('additionalFee', { valueAsNumber: true })}
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
              {...register('wholesaleDiscount', { valueAsNumber: true })}
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
              {...register('desiredPrice', { valueAsNumber: true })}
              placeholder="Deixe vazio para usar o preço calculado"
            />
            <p className="text-xs text-muted-foreground mt-2">
              💡 Preencha para comparar seu preço com o valor sugerido pelo cálculo
            </p>
          </div>

          {/* Opção para arredondar o preço final */}
          <div className="pt-4 flex items-center space-x-2">
            <Controller
              control={control}
              name="roundPrice"
              render={({ field }) => (
                <>
                  <Checkbox id="roundPrice" checked={!!field.value} onCheckedChange={(val) => field.onChange(!!val)} />
                  <Label htmlFor="roundPrice" className="cursor-pointer">
                    Arredondar preço final (valor inteiro)
                  </Label>
                </>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botão Calcular */}
      <Button
        onClick={handleSubmit(onSubmit)}
        className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-lg py-6"
        size="lg"
      >
        <Calculator className="mr-2 h-5 w-5" />
        Calcular Custos
      </Button>
    </div>
  );
};