import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InputWithLabel } from '@/components/ui/input-with-label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { CalculatorInputs, CalculationResults } from '@/types/calculator'
import { calculateCosts } from '@/utils/calculator'
import {
  DollarSign,
  TrendingUp,
  X,
  Info,
} from 'lucide-react'

/**
 * Componente que exibe um cartão com o valor sugerido de venda, lucro líquido,
 * custo de produção e controles para ajustar a margem de lucro (markup) via
 * slider ou informar um preço final manualmente. Também permite abrir um
 * modal com o detalhamento de custos e gerar um orçamento.
 *
 * Esta versão inclui a exibição de valores por unidade quando a quantidade
 * informada for maior que 1. Assim, o usuário pode verificar o custo,
 * preço e lucro unitários, além dos valores de atacado por unidade.
 */
interface CalculationCardProps {
  /** Entradas originais da calculadora após o cálculo inicial */
  inputs: CalculatorInputs
  /** Resultados originais do cálculo com a margem padrão */
  results: CalculationResults
  /** Função chamada ao gerar o orçamento. Deve receber as entradas e resultados atualizados */
  onGenerateQuote: (inputs: CalculatorInputs, results: CalculationResults) => void
}

export const CalculationCard = ({ inputs, results, onGenerateQuote }: CalculationCardProps) => {
  // Estado local para a margem de lucro ajustável pelo slider (markup)
  const [markup, setMarkup] = useState<number>(inputs.profitMargin)
  // Estado local para preço manual. Quando undefined, usa o valor calculado automaticamente
  const [manualPrice, setManualPrice] = useState<number | undefined>(inputs.desiredPrice)
  // Estado para controlar exibição do modal de detalhamento de custos
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false)

  // Recalcula os resultados sempre que o markup é alterado
  const [calcResults, setCalcResults] = useState<CalculationResults>(results)
  useEffect(() => {
    // Cria uma cópia das entradas com a margem atualizada
    const updatedInputs: CalculatorInputs = {
      ...inputs,
      profitMargin: markup,
    }
    const newResults = calculateCosts(updatedInputs)
    setCalcResults(newResults)
  }, [markup, inputs])

  // Calcula métricas para exibição. Considera o preço manual se definido
  const cost = calcResults.productionCost
  // Valor das taxas (fee) é a diferença entre o preço final com taxa e sem taxa
  const feeValue = calcResults.finalPriceWithFee - calcResults.finalPrice
  let finalPrice = calcResults.finalPriceWithFee
  let profit = calcResults.profitAmount
  // Se houver um preço manual informado, ajusta o preço final e o lucro.
  // Como manualPrice é do tipo number | undefined, basta verificar se é diferente de undefined.
  if (manualPrice !== undefined && manualPrice !== null) {
    finalPrice = manualPrice
    // Considera que a taxa permanece a mesma; calcula o lucro subtraindo custo e taxa
    profit = finalPrice - cost - feeValue
  }
  // ROI (%) = lucro / custo * 100
  const roiPercentage = cost > 0 ? (profit / cost) * 100 : 0
  // Margem real (%) = lucro / preço final * 100
  const realMargin = finalPrice > 0 ? (profit / finalPrice) * 100 : 0

  // Desconto de atacado (percentual). Se não informado, assume 0.
  const wholesaleDiscount = inputs.wholesaleDiscount ?? 0
  // Preço no atacado aplica o desconto sobre o preço final (já incluindo taxa)
  const wholesalePrice = finalPrice * (1 - wholesaleDiscount / 100)
  // Lucro líquido no atacado (valor total) – calcula depois custos e taxa
  const wholesaleProfit = wholesalePrice - cost - feeValue
  // Lucro do revendedor total (diferença entre preço de venda normal e preço atacado)
  const resellerProfit = finalPrice - wholesalePrice
  // Margem de lucro do revendedor em relação ao preço de atacado total
  const resellerMargin = wholesalePrice > 0 ? (resellerProfit / wholesalePrice) * 100 : 0

  // === Valores por unidade ===
  // Número de unidades (garante ao menos 1 para evitar divisão por zero)
  const quantity = inputs.quantity && inputs.quantity > 0 ? inputs.quantity : 1
  // Preço por unidade (considerando o preço final com taxas ou o preço manual)
  const pricePerUnit = finalPrice / quantity
  // Custo por unidade
  const costPerUnit = calcResults.costPerUnit
  // Fee (taxa) por unidade
  const feePerUnit = feeValue / quantity
  // Lucro por unidade (considerando o preço final com taxa ou manual)
  const profitPerUnitCalc = pricePerUnit - costPerUnit - feePerUnit
  // Preço de atacado por unidade
  const wholesalePricePerUnit = wholesalePrice / quantity
  // Lucro de atacado por unidade
  const wholesaleProfitPerUnit = wholesalePricePerUnit - costPerUnit - feePerUnit

  // Handler para alteração do slider de markup
  const handleSliderChange = (value: number[]) => {
    // O componente Slider devolve um array com um valor
    if (Array.isArray(value) && value.length > 0) {
      setMarkup(value[0])
    }
  }

  // Handler para alteração do campo manual de preço
  const handleManualPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === '') {
      setManualPrice(undefined)
    } else {
      const num = Number(val)
      setManualPrice(isNaN(num) ? undefined : num)
    }
  }

  // Handler para gerar orçamento com os valores atuais
  const handleGenerateQuote = () => {
    // Define o preço desejado caso o usuário tenha inserido manualmente
    const updatedInputs: CalculatorInputs = {
      ...inputs,
      profitMargin: markup,
      desiredPrice: manualPrice,
    }
    const updatedResults = calculateCosts(updatedInputs)
    onGenerateQuote(updatedInputs, updatedResults)
  }

  return (
    <div className="space-y-4">
      {/* Card principal com valores e controles */}
      <Card className="border-2 shadow-xl">
        <CardHeader className="bg-gradient-primary text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resultado da Precificação
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Preço de venda sugerido ou manual */}
            <div className="p-3 bg-card rounded border flex flex-col justify-between">
              <div className="text-sm text-muted-foreground mb-1">Preço de Venda</div>
              <div className="text-2xl font-bold">
                R$ {finalPrice.toFixed(2)}
              </div>
              {manualPrice !== undefined && (
                <div className="text-xs text-muted-foreground">(Preço manual)</div>
              )}
            </div>
            {/* Lucro líquido */}
            <div className="p-3 bg-card rounded border flex flex-col justify-between">
              <div className="text-sm text-muted-foreground mb-1">Lucro Líquido</div>
              <div className={`text-2xl font-bold ${profit < 0 ? 'text-destructive' : ''}`}>
                R$ {profit.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {profit < 0
                  ? 'Prejuízo'
                  : `Lucro de ${realMargin.toFixed(1)}% sobre venda`}
              </div>
            </div>
            {/* Custo de produção */}
            <div className="p-3 bg-card rounded border flex flex-col justify-between">
              <div className="text-sm text-muted-foreground mb-1">Custo de Produção</div>
              <div className="text-2xl font-bold">R$ {cost.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">
                Inclui falha ({inputs.failureRate}%), embalagem e extras
              </div>
            </div>
            {/* Taxas (marketplace) */}
            <div className="p-3 bg-card rounded border flex flex-col justify-between">
              <div className="text-sm text-muted-foreground mb-1">Taxas / Impostos</div>
              <div className="text-2xl font-bold">R$ {feeValue.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">
                {inputs.additionalFee}% do valor de venda
              </div>
            </div>
            {/* ROI */}
            <div className="p-3 bg-card rounded border flex flex-col justify-between">
              <div className="text-sm text-muted-foreground mb-1">ROI (%)</div>
              <div className="text-2xl font-bold">
                {roiPercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Retorno sobre o custo</div>
            </div>
            {/* Margem Real */}
            <div className="p-3 bg-card rounded border flex flex-col justify-between">
              <div className="text-sm text-muted-foreground mb-1">Margem Real (%)</div>
              <div className="text-2xl font-bold">
                {realMargin.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Lucro / Preço de Venda</div>
            </div>

            {/* Preço de Atacado */}
            <div className="p-3 bg-card rounded border flex flex-col justify-between">
              <div className="text-sm text-muted-foreground mb-1">Preço de Atacado</div>
              <div className="text-2xl font-bold">R$ {wholesalePrice.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">
                Desconto de {wholesaleDiscount.toFixed(1)}%
              </div>
            </div>
            {/* Lucro no Atacado */}
            <div className="p-3 bg-card rounded border flex flex-col justify-between">
              <div className="text-sm text-muted-foreground mb-1">Lucro no Atacado</div>
              <div className={`text-2xl font-bold ${wholesaleProfit < 0 ? 'text-destructive' : ''}`}>
                R$ {wholesaleProfit.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {wholesaleProfit < 0 ? 'Prejuízo' : 'Lucro total para você'}
              </div>
            </div>
            {/* Margem do Revendedor */}
            <div className="p-3 bg-card rounded border flex flex-col justify-between">
              <div className="text-sm text-muted-foreground mb-1">Margem do Revendedor</div>
              <div className="text-2xl font-bold">
                {resellerMargin.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Lucro sobre o preço de atacado</div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Controle de Markup */}
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
              Ajuste a margem de lucro em relação ao custo de produção. Deslize para aumentar ou diminuir o lucro.
            </p>
          </div>

          {/* Preço manual */}
          <div className="space-y-1">
            <InputWithLabel
              label="Preço de Venda Manual (opcional)"
              id="manualPrice"
              type="number"
              step="0.01"
              min="0"
              value={manualPrice === undefined ? '' : manualPrice}
              onChange={handleManualPriceChange}
              placeholder="Insira um valor de venda..."
            />
            <p className="text-xs text-muted-foreground">
              Informe um valor final para simular lucro/prejuízo manualmente. Deixe em branco para usar o valor calculado.
            </p>
          </div>

          {/* Valores por unidade (mostra se quantidade > 1) */}
          {quantity > 1 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Valores por unidade</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Preço unitário */}
                  <div className="p-3 bg-card rounded border flex flex-col justify-between">
                    <div className="text-sm text-muted-foreground mb-1">Preço por Unidade</div>
                    <div className="text-xl font-bold">R$ {pricePerUnit.toFixed(2)}</div>
                  </div>
                  {/* Custo unitário */}
                  <div className="p-3 bg-card rounded border flex flex-col justify-between">
                    <div className="text-sm text-muted-foreground mb-1">Custo por Unidade</div>
                    <div className="text-xl font-bold">R$ {costPerUnit.toFixed(2)}</div>
                  </div>
                  {/* Lucro unitário */}
                  <div className="p-3 bg-card rounded border flex flex-col justify-between">
                    <div className="text-sm text-muted-foreground mb-1">Lucro por Unidade</div>
                    <div className={`text-xl font-bold ${profitPerUnitCalc < 0 ? 'text-destructive' : ''}`}>
                      R$ {profitPerUnitCalc.toFixed(2)}
                    </div>
                  </div>
                  {/* Preço atacado por unidade */}
                  <div className="p-3 bg-card rounded border flex flex-col justify-between">
                    <div className="text-sm text-muted-foreground mb-1">Atacado por Unidade</div>
                    <div className="text-xl font-bold">R$ {wholesalePricePerUnit.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      {wholesaleDiscount.toFixed(1)}% desc.
                    </div>
                  </div>
                  {/* Lucro atacado por unidade */}
                  <div className="p-3 bg-card rounded border flex flex-col justify-between">
                    <div className="text-sm text-muted-foreground mb-1">Lucro Atacado por Unidade</div>
                    <div className={`text-xl font-bold ${wholesaleProfitPerUnit < 0 ? 'text-destructive' : ''}`}>
                      R$ {wholesaleProfitPerUnit.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator className="my-4" />

          {/* Ações */}
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              onClick={() => setShowBreakdown(true)}
              className="flex-1 bg-gradient-accent text-accent-foreground hover:opacity-90"
            >
              <Info className="h-4 w-4 mr-2" />
              Como os gastos foram calculados
            </Button>
            <Button
              onClick={handleGenerateQuote}
              className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Gerar Orçamento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalhamento de custos */}
      {showBreakdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-card max-w-lg w-full rounded-lg shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Raio‑X do Preço</h2>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowBreakdown(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Distribuição percentual */}
              <div>
                <p className="text-sm font-medium mb-1">Distribuição do valor de venda</p>
                {/* Barra horizontal com cores: custos, taxas e lucro */}
                <div className="flex h-4 w-full rounded overflow-hidden border">
                  {/* Custos */}
                  <div
                    className="bg-destructive/50"
                    style={{ width: `${(cost / finalPrice) * 100}%` }}
                  />
                  {/* Taxas */}
                  <div
                    className="bg-warning/50"
                    style={{ width: `${(feeValue / finalPrice) * 100}%` }}
                  />
                  {/* Lucro */}
                  <div
                    className="bg-success/50"
                    style={{ width: `${(profit / finalPrice) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Custo: {((cost / finalPrice) * 100).toFixed(1)}%</span>
                  <span>Taxas: {((feeValue / finalPrice) * 100).toFixed(1)}%</span>
                  <span>Lucro: {((profit / finalPrice) * 100).toFixed(1)}%</span>
                </div>
              </div>
              {/* Detalhamento de custos */}
              <div className="space-y-2">
                <p className="text-sm font-medium mb-1">1. Custo Industrial</p>
                {/* Lista de itens de custo. Utilizamos os valores de calcResults (antes de ajustar lucro/taxas) para mostrar o custo base */}
                <div className="flex justify-between text-sm"><span>Material Consumido</span><span>R$ {calcResults.filamentCost.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Energia Elétrica</span><span>R$ {calcResults.energyCost.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Mão de Obra</span><span>R$ {calcResults.laborCost.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Manutenção</span><span>R$ {calcResults.maintenanceTotalCost.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Acabamento</span><span>R$ {inputs.finishingCost.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Embalagem &amp; Extras</span><span>R$ {(calcResults.packagingCost + calcResults.extraCost).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Margem de Falha</span><span>R$ {calcResults.failureCost.toFixed(2)}</span></div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-sm"><span>Total Custo</span><span>R$ {cost.toFixed(2)}</span></div>
              </div>
              {/* Marcup e taxas */}
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium mb-1">Markup e Taxas</p>
                <div className="flex justify-between text-sm"><span>Markup de {markup.toFixed(0)}%</span><span>R$ {calcResults.profitAmount.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Taxa Marketplace ({inputs.additionalFee}%)</span><span>R$ {feeValue.toFixed(2)}</span></div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-sm"><span>Lucro Líquido</span><span>R$ {profit.toFixed(2)}</span></div>
              </div>
              {/* Fechar modal */}
              <div className="text-right">
                <Button onClick={() => setShowBreakdown(false)} variant="ghost" className="text-primary">
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}