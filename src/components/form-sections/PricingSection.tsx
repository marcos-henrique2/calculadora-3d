import { useFormContext } from "react-hook-form";
import { CalculatorInputs } from "@/types/calculator";
import { FormSection } from "@/components/FormSection";
import { Field, Grid2 } from "@/components/FieldGroup";
import { cn } from "@/lib/utils";
import { DollarSign } from "lucide-react";
import { inputCls } from "./shared";

export const PricingSection = () => {
  const { register } = useFormContext<CalculatorInputs>();

  return (
    <FormSection
      title="Margem e precificação"
      description="Lucro desejado, taxas de marketplace e atacado"
      icon={<DollarSign size={17} />}
      iconBg="#EDE9FE"
      iconColor="#4C1D95"
    >
      <Grid2>
        <Field label="Margem de lucro (%)" htmlFor="profitMargin">
          <input id="profitMargin" type="number" step="1" min="0" className={cn(inputCls, "font-mono")} {...register("profitMargin", { valueAsNumber: true })} />
        </Field>
        <Field label="Taxa marketplace (%)" htmlFor="additionalFee" hint="Mercado Livre, Etsy, etc.">
          <input id="additionalFee" type="number" step="0.1" min="0" className={cn(inputCls, "font-mono")} {...register("additionalFee", { valueAsNumber: true })} />
        </Field>
      </Grid2>

      <Grid2>
        <Field label="Desconto para atacado (%)" htmlFor="wholesaleDiscount" hint="0 = sem preço de atacado">
          <input id="wholesaleDiscount" type="number" step="0.1" min="0" max="100" className={cn(inputCls, "font-mono")} {...register("wholesaleDiscount", { valueAsNumber: true })} />
        </Field>
        <Field label="Preço desejado — opcional (R$)" htmlFor="desiredPrice" hint="Deixe vazio para calcular automaticamente">
          <input
            id="desiredPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 50,00"
            className={cn(inputCls, "font-mono")}
            {...register("desiredPrice", {
              setValueAs: (v) => (v === "" || v == null || isNaN(Number(v)) ? undefined : Number(v)),
            })}
          />
        </Field>
      </Grid2>
    </FormSection>
  );
};
