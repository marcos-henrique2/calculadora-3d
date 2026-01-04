import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
// Removed Input and Textarea imports because the publication form is no longer used
import { CalculationResults, CalculatorInputs } from '@/types/calculator'
import {
  DollarSign,
  Clock,
  TrendingUp,
  AlertCircle,
  Calculator,
  Target,
  Package,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react'
// supabase and useToast imports removed because publication form was removed

/**
 * Mostra o resultado detalhado dos custos e métricas financeiras da impressão.
 * ... (resto da descrição do componente) ...
 */
interface ResultsDisplayProps {
  results: CalculationResults | null
  inputs: CalculatorInputs
  /**
   * Callback opcional para navegar até a aba de orçamento.
   * Quando fornecido, será chamado ao clicar no botão de gerar orçamento.
   */
  onNavigateToQuote?: () => void
}

export const ResultsDisplay = ({ results, inputs, onNavigateToQuote }: ResultsDisplayProps) => {
  // Publication form removed: no local state for product publishing

  // Se não houver resultados, instrui o usuário a preencher os campos.
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
    )
  }

  // Lista para o detalhamento de custos básicos
  const costBreakdown = [
    { label: 'Filamento', value: results.filamentCost, icon: DollarSign },
    { label: 'Energia Elétrica', value: results.energyCost, icon: DollarSign },
    { label: 'Desgaste da Impressora', value: results.wearCost, icon: DollarSign },
    { label: 'Mão de Obra', value: results.laborCost, icon: DollarSign },
    { label: 'Manutenção', value: results.maintenanceTotalCost, icon: DollarSign },
    { label: 'Acabamento', value: inputs.finishingCost, icon: DollarSign },
    { label: 'Margem de Falha', value: results.failureCost, icon: AlertCircle },
  ]

  // Cálculos de ROI usando lucro por unidade
  const profitPerUnit = results.profitPerUnit
  const piecesToRecover = profitPerUnit > 0 ? Math.ceil(inputs.printerValue / profitPerUnit) : Infinity
  const monthsToRecover = profitPerUnit > 0 ? piecesToRecover / 30 : Infinity
  const monthlyProfit = profitPerUnit * 30
  const roiPercentage = profitPerUnit > 0 ? (profitPerUnit / inputs.printerValue) * 100 : 0

  // Ajuste de exibição do preço final: se roundPrice for verdadeiro, arredonda o valor final
  const displayFinalPrice = inputs.roundPrice
    ? Math.round(results.finalPriceWithFee)
    : results.finalPriceWithFee
  const displayFinalPricePerUnit = inputs.roundPrice
    ? Math.round(displayFinalPrice / (inputs.quantity > 0 ? inputs.quantity : 1))
    : results.finalPricePerUnit

  return (
    <div className="space-y-6">
      {/* Análise de Preço Desejado */}
      {inputs.desiredPrice && inputs.desiredPrice > 0 && (
        <Card className="border-2 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Análise de Preço
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {(() => {
              // Se roundPrice for verdadeiro, usamos o preço final arredondado para comparação
              const basePrice = inputs.roundPrice ? displayFinalPrice : results.finalPriceWithFee
              const suggestedPrice = basePrice
              const desiredPrice = inputs.desiredPrice!
              const difference = desiredPrice - suggestedPrice
              const percentageDiff = (difference / suggestedPrice) * 100

              let status: 'low' | 'ideal' | 'high'
              let statusColor: string
              let bgColor: string
              let icon: React.ReactNode
              let message: string

              if (percentageDiff < -10) {
                status = 'low'
                statusColor = 'text-destructive'
                bgColor = 'bg-destructive/10 border-destructive/20'
                icon = <AlertTriangle className="h-8 w-8 text-destructive" />
                message = 'Seu preço está muito abaixo do recomendado! Você pode estar perdendo dinheiro.'
              } else if (percentageDiff >= -10 && percentageDiff <= 15) {
                status = 'ideal'
                statusColor = 'text-success'
                bgColor = 'bg-success/10 border-success/20'
                icon = <CheckCircle className="h-8 w-8 text-success" />
                message = 'Preço ideal! Está dentro da faixa competitiva e lucrativa.'
              } else {
                status = 'high'
                statusColor = 'text-warning'
                bgColor = 'bg-warning/10 border-warning/20'
                icon = <Info className="h-8 w-8 text-warning" />
                message = 'Seu preço está acima do recomendado. Pode afetar a competitividade.'
              }

              return (
                <div className="space-y-4">
                  <div className={`p-6 rounded-lg border-2 ${bgColor} flex items-start gap-4`}>
                    <div className="flex-shrink-0">{icon}</div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold ${statusColor} mb-2`}>
                        {status === 'low'
                          ? 'ABAIXO DO IDEAL'
                          : status === 'ideal'
                          ? 'PREÇO IDEAL'
                          : 'ACIMA DO IDEAL'}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">{message}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-card p-3 rounded border">
                          <p className="text-xs text-muted-foreground mb-1">Preço Sugerido</p>
                          <p className="text-lg font-bold">
                            R$ {inputs.roundPrice ? suggestedPrice.toFixed(0) : suggestedPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-card p-3 rounded border">
                          <p className="text-xs text-muted-foreground mb-1">Seu Preço</p>
                          <p className={`text-lg font-bold ${statusColor}`}>R$ {desiredPrice.toFixed(2)}</p>
                        </div>
                        <div className="bg-card p-3 rounded border">
                          <p className="text-xs text-muted-foreground mb-1">Diferença</p>
                          <p className={`text-lg font-bold ${statusColor}`}>
                            {difference >= 0 ? '+' : ''}R$ {difference.toFixed(2)}
                            <span className="text-sm ml-1">
                              ({percentageDiff >= 0 ? '+' : ''}
                              {percentageDiff.toFixed(1)}%)
                            </span>
                          </p>
                        </div>
                      </div>

                      {status === 'low' && (
                        <div className="mt-4 p-3 bg-destructive/5 border border-destructive/20 rounded">
                          <p className="text-xs text-destructive font-semibold">
                            ⚠️ Atenção: Com esse preço, seu lucro real será de apenas R${' '}
                            {(desiredPrice - results.productionCost).toFixed(2)} (
                            {(((desiredPrice - results.productionCost) / results.productionCost) * 100).toFixed(1)}%
                            de margem)
                          </p>
                        </div>
                      )}

                      {status === 'high' && (
                        <div className="mt-4 p-3 bg-warning/5 border border-warning/20 rounded">
                          <p className="text-xs text-warning font-semibold">
                            💡 Dica: Seu lucro será maior (R$ {(desiredPrice - results.productionCost).toFixed(2)}), mas
                            verifique se o mercado aceita esse valor.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* Cards de Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Custo total */}
        <Card className="bg-gradient-primary text-primary-foreground border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Custo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {results.productionCost.toFixed(2)}</div>
            <p className="text-xs opacity-80 mt-1">R$ {results.costPerUnit.toFixed(2)} por unidade</p>
          </CardContent>
        </Card>

        {/* Margem de lucro */}
        <Card className="bg-gradient-accent text-accent-foreground border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Margem de Lucro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {results.profitAmount.toFixed(2)}</div>
            <p className="text-xs opacity-80 mt-1">{inputs.profitMargin}% sobre o custo</p>
          </CardContent>
        </Card>

        {/* Preço final */}
        <Card className="bg-success text-success-foreground border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Preço Final
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {inputs.roundPrice ? displayFinalPrice.toFixed(0) : results.finalPriceWithFee.toFixed(2)}
            </div>
            <p className="text-xs opacity-80 mt-1">
              {inputs.additionalFee > 0 ? `Com ${inputs.additionalFee}% de taxa` : 'Sem taxas adicionais'}
            </p>
            {/* Mostra o preço final por unidade */}
            <p className="text-xs opacity-80 mt-1">
              R$ {inputs.roundPrice ? displayFinalPricePerUnit.toFixed(0) : results.finalPricePerUnit.toFixed(2)} por
              unidade
            </p>
          </CardContent>
        </Card>

        {/* Tempo total */}
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
              <div className="text-3xl font-bold text-primary mb-1">{profitPerUnit > 0 ? piecesToRecover : '—'}</div>
              <p className="text-sm text-muted-foreground">
                Peças necessárias para recuperar investimento da impressora
              </p>
            </div>

            {/* Tempo para recuperar (estimativa 30 peças/mês) */}
            <div className="text-center p-4 bg-card rounded-lg border-2">
              <Clock className="h-8 w-8 mx-auto mb-2 text-accent" />
              <div className="text-3xl font-bold text-accent mb-1">
                {profitPerUnit > 0 ? monthsToRecover.toFixed(1) : '—'}
              </div>
              <p className="text-sm text-muted-foreground">
                Meses para recuperar investimento (estimativa: 30 peças/mês)
              </p>
            </div>

            {/* Lucro mensal estimado */}
            <div className="text-center p-4 bg-card rounded-lg border-2">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-success" />
              <div className="text-3xl font-bold text-success mb-1">
                R$ {profitPerUnit > 0 ? monthlyProfit.toFixed(2) : '—'}
              </div>
              <p className="text-sm text-muted-foreground">Lucro líquido mensal estimado (30 peças/mês)</p>
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
              <span className="font-semibold text-success">R$ {profitPerUnit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ROI percentual:</span>
              <span className="font-semibold text-primary">
                {profitPerUnit > 0 ? roiPercentage.toFixed(2) : '0.00'}% por peça
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-xs text-center text-muted-foreground">
              💡 <strong>Dica:</strong> Os cálculos consideram uma média de 30 peças por mês. Ajuste sua produção e
              margem de lucro para atingir seus objetivos financeiros.
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
              const Icon = item.icon
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
              )
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
                {inputs.complexity === 'simple'
                  ? 'Simples'
                  : inputs.complexity === 'intermediate'
                  ? 'Intermediária'
                  : 'Alta'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão para ir à página de Orçamentos */}
      {results && (
        <div className="pt-4">
          <Button
            onClick={() => {
              if (onNavigateToQuote) {
                onNavigateToQuote()
                // Rolagem para o topo para mostrar a aba de orçamento
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }, 50)
              } else {
                // Fallback: tenta clicar no trigger da aba se o callback não for fornecido
                const quoteTabTrigger = document.querySelector('[role="tab"][value="quote"]') as HTMLElement | null
                if (quoteTabTrigger) {
                  quoteTabTrigger.click()
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }, 50)
                }
              }
            }}
            className="w-full bg-gradient-accent text-accent-foreground hover:opacity-90 transition-opacity text-lg py-6"
          >
            Gerar Orçamento
          </Button>
        </div>
      )}

      {/* Formulário de publicação removido */}
    </div>
  )
}
