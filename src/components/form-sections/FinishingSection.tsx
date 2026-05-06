import { useFormContext } from "react-hook-form";
import { CalculatorInputs } from "@/types/calculator";
import { FormSection } from "@/components/FormSection";
import { Field, Grid2, Grid3 } from "@/components/FieldGroup";
import { cn } from "@/lib/utils";
import { Wrench } from "lucide-react";
import { inputCls } from "./shared";

export const FinishingSection = () => {
  const { register } = useFormContext<CalculatorInputs>();

  return (
    <FormSection
      title="Trabalho e acabamento"
      description="Mão de obra, manutenção, embalagem e perdas"
      icon={<Wrench size={17} />}
      iconBg="#FEF3C7"
      iconColor="#92400E"
    >
      <Grid2>
        <Field label="Valor hora de trabalho (R$/h)" htmlFor="hourlyRate">
          <input id="hourlyRate" type="number" step="0.01" min="0" className={cn(inputCls, "font-mono")} {...register("hourlyRate", { valueAsNumber: true })} />
        </Field>
        <Field label="Tempo de trabalho ativo (h)" htmlFor="activeWorkTime" hint="Horas que você atua manualmente">
          <input id="activeWorkTime" type="number" step="0.1" min="0" className={cn(inputCls, "font-mono")} {...register("activeWorkTime", { valueAsNumber: true })} />
        </Field>
      </Grid2>

      <Grid3>
        <Field label="Custo de acabamento (R$)" htmlFor="finishingCost">
          <input id="finishingCost" type="number" step="0.01" min="0" className={cn(inputCls, "font-mono")} {...register("finishingCost", { valueAsNumber: true })} />
        </Field>
        <Field label="Manutenção (R$/h de impressão)" htmlFor="maintenanceCost">
          <input id="maintenanceCost" type="number" step="0.01" min="0" className={cn(inputCls, "font-mono")} {...register("maintenanceCost", { valueAsNumber: true })} />
        </Field>
        <Field label="Taxa de falha / perda (%)" htmlFor="failureRate">
          <input id="failureRate" type="number" step="0.1" min="0" max="100" className={cn(inputCls, "font-mono")} {...register("failureRate", { valueAsNumber: true })} />
        </Field>
      </Grid3>

      <Grid2>
        <Field label="Embalagem (R$)" htmlFor="packagingCost">
          <input id="packagingCost" type="number" step="0.01" min="0" className={cn(inputCls, "font-mono")} {...register("packagingCost", { valueAsNumber: true })} />
        </Field>
        <Field label="Outros custos extras (R$)" htmlFor="extraCost">
          <input id="extraCost" type="number" step="0.01" min="0" className={cn(inputCls, "font-mono")} {...register("extraCost", { valueAsNumber: true })} />
        </Field>
      </Grid2>
    </FormSection>
  );
};
