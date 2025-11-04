import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalculationResults, CalculatorInputs } from "@/types/calculator";
import {
  FileText,
  Download,
  CheckCircle2,
  Trash2,
  Pencil,
  Clock,
  TrendingUp,
  User,
} from "lucide-react";
import { generateQuotePDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

interface SavedBudget {
  id: string;
  inputs: CalculatorInputs;
  results: CalculationResults;
  createdAt: string;
}

interface QuoteTabProps {
  results: CalculationResults | null;
  inputs: CalculatorInputs;
  onLoadBudget?: (budget: SavedBudget) => void;
}

export const QuoteTab = ({ results, inputs, onLoadBudget }: QuoteTabProps) => {
  const { toast } = useToast();

  const [savedBudgets, setSavedBudgets] = useState<SavedBudget[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedBudgetId");
    }
    return null;
  });

  // Carrega orçamentos do localStorage
  useEffect(() => {
    const stored = localStorage.getItem("savedBudgets");
    if (stored) {
      try {
        const parsed: SavedBudget[] = JSON.parse(stored);
        setSavedBudgets(parsed);
      } catch (error) {
        console.error("Erro ao carregar orçamentos do armazenamento local", error);
      }
    }
  }, []);

  // Persiste seleção
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (selectedBudgetId) {
        localStorage.setItem("selectedBudgetId", selectedBudgetId);
      } else {
        localStorage.removeItem("selectedBudgetId");
      }
    }
  }, [selectedBudgetId]);

  // Atualiza quando há novo resultado
  useEffect(() => {
    if (results) {
      setSelectedBudgetId(null);
    }
  }, [results]);

  const persistBudgets = (budgets: SavedBudget[]) => {
    localStorage.setItem("savedBudgets", JSON.stringify(budgets));
  };

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleSaveBudget = () => {
    if (!results) {
      toast({
        title: "Erro",
        description: "Calcule os custos antes de salvar o orçamento",
        variant: "destructive",
      });
      return;
    }

    const newBudget: SavedBudget = {
      id: generateId(),
      inputs: { ...inputs },
      results: { ...results },
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedBudgets, newBudget];
    setSavedBudgets(updated);
    persistBudgets(updated);

    toast({
      title: "Orçamento salvo!",
      description: "O orçamento foi salvo no seu navegador.",
    });
    setSelectedBudgetId(newBudget.id);
  };

  const handleDeleteBudget = (id: string) => {
    const updated = savedBudgets.filter((b) => b.id !== id);
    setSavedBudgets(updated);
    persistBudgets(updated);
    toast({
      title: "Orçamento excluído",
      description: "O orçamento foi removido da lista.",
    });
    if (id === selectedBudgetId) {
      setSelectedBudgetId(null);
    }
  };

  const handleGeneratePDF = () => {
    const budgetFromList = selectedBudgetId
      ? savedBudgets.find((b) => b.id === selectedBudgetId)
      : null;
    const activeInputs = budgetFromList ? budgetFromList.inputs : inputs;
    const activeResults = budgetFromList ? budgetFromList.results : results;
    if (!activeResults) {
      toast({
        title: "Erro",
        description: "Nenhum orçamento selecionado ou calculado para gerar PDF",
        variant: "destructive",
      });
      return;
    }

    try {
      generateQuotePDF(activeInputs, activeResults);
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

  return (
    <div className="space-y-8">
      {/* Card principal */}
      <Card className="border-2 shadow-xl">
        <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-xl">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <CardTitle className="text-2xl">Orçamento</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {(() => {
            const selectedBudget = selectedBudgetId
              ? savedBudgets.find((b) => b.id === selectedBudgetId)
              : null;
            const activeInputs = selectedBudget ? selectedBudget.inputs : inputs;
            const activeResults = selectedBudget ? selectedBudget.results : results;

            if (!activeResults) {
              return (
                <div className="text-center text-muted-foreground">
                  <p>Selecione um orçamento salvo ou calcule custos na aba "Calculadora".</p>
                </div>
              );
            }

            return (
              <>
                {/* Informações da Peça */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    Informações do Projeto
                  </h3>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Cliente</p>
                        <p className="font-semibold">
                          {activeInputs.clientName || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Peça</p>
                        <p className="font-semibold">{activeInputs.pieceName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Quantidade</p>
                        <p className="font-semibold">
                          {activeInputs.quantity} unidade(s)
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Material</p>
                        <p className="font-semibold">{activeInputs.material}</p>
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
                      <span className="font-medium">
                        R$ {activeResults.productionCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Custo por Unidade:</span>
                      <span className="font-medium">
                        R$ {activeResults.costPerUnit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Margem de Lucro ({activeInputs.profitMargin}%):
                      </span>
                      <span className="font-medium text-success">
                        R$ {activeResults.profitAmount.toFixed(2)}
                      </span>
                    </div>
                    {activeInputs.additionalFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Taxa Adicional ({activeInputs.additionalFee}%):
                        </span>
                        <span className="font-medium">
                          R$
                          {(
                            activeResults.finalPriceWithFee -
                            activeResults.finalPrice
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-3" />

                  <div className="bg-gradient-accent text-accent-foreground p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">PREÇO TOTAL:</span>
                      <span className="text-2xl font-bold">
                        R$ {activeResults.finalPriceWithFee.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}

          <Separator />

          {/* Botões */}
          <div className="space-y-3">
            <Button
              onClick={handleGeneratePDF}
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-lg py-6"
              size="lg"
              disabled={
                !(selectedBudgetId
                  ? savedBudgets.some((b) => b.id === selectedBudgetId)
                  : !!results)
              }
            >
              <Download className="mr-2 h-5 w-5" />
              Gerar Orçamento em PDF
            </Button>

            {results && (
              <Button
                onClick={handleSaveBudget}
                className="w-full bg-gradient-accent hover:opacity-90 transition-opacity text-lg py-6"
                size="lg"
              >
                <FileText className="mr-2 h-5 w-5" />
                Salvar Orçamento
              </Button>
            )}
            <p className="text-xs text-center text-muted-foreground">
              O PDF será baixado automaticamente com todos os detalhes do orçamento
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Orçamentos Salvos */}
      <Card className="border-2">
        <CardHeader className="bg-secondary">
          <CardTitle>Orçamentos Salvos</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {savedBudgets.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum orçamento salvo ainda.
            </p>
          )}
          {savedBudgets.map((budget) => (
            <div
              key={budget.id}
              className={`p-4 border rounded-lg flex flex-col gap-2 cursor-pointer ${
                selectedBudgetId === budget.id ? "bg-muted/70" : "bg-muted"
              }`}
              onClick={() => setSelectedBudgetId(budget.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium flex items-center gap-1">
                    <User className="h-4 w-4 text-primary" />
                    {budget.inputs.clientName || "Sem nome"} —{" "}
                    {budget.inputs.pieceName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Criado em {new Date(budget.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onLoadBudget) {
                        onLoadBudget(budget);
                      }
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-1" />Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBudget(budget.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />Excluir
                  </Button>
                </div>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />{" "}
                  {Math.floor(budget.results.totalTime)}h{" "}
                  {Math.round((budget.results.totalTime % 1) * 60)}min
                </span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" /> R${" "}
                  {budget.results.finalPriceWithFee.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
