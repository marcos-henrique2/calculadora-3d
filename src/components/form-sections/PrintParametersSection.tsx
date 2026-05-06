import { useFormContext, Controller } from "react-hook-form";
import { CalculatorInputs } from "@/types/calculator";
import { FormSection } from "@/components/FormSection";
import { Field, Grid2, Grid3, TimeInput } from "@/components/FieldGroup";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";
import { inputCls, selectCls } from "./shared";

export const PrintParametersSection = () => {
  const { register, control } = useFormContext<CalculatorInputs>();

  return (
    <FormSection
      title="Filamento e impressão"
      description="Material consumido, tempo e parâmetros da máquina"
      icon={<Layers size={17} />}
      iconBg="#DCFCE7"
      iconColor="#166534"
    >
      <Grid2>
        <Field label="Preço do filamento (R$/kg)" htmlFor="filamentPrice">
          <input id="filamentPrice" type="number" step="0.01" min="0" className={cn(inputCls, "font-mono")} {...register("filamentPrice", { valueAsNumber: true })} />
        </Field>
        <Field label="Filamento consumido (g) — lote total" htmlFor="filamentUsed" hint="Peso total gasto no lote inteiro">
          <input id="filamentUsed" type="number" step="0.1" min="0" className={cn(inputCls, "font-mono")} {...register("filamentUsed", { valueAsNumber: true })} />
        </Field>
      </Grid2>

      <Field label="Tempo de impressão do lote completo" htmlFor="printTimeHours">
        <TimeInput
          idHours="printTimeHours"
          idMinutes="printTimeMinutes"
          registerHours={register("printTimeHours", { valueAsNumber: true })}
          registerMinutes={register("printTimeMinutes", { valueAsNumber: true })}
        />
      </Field>

      <Grid3>
        <Field label="Potência da impressora (W)" htmlFor="printerPower">
          <input id="printerPower" type="number" min="0" className={cn(inputCls, "font-mono")} {...register("printerPower", { valueAsNumber: true })} />
        </Field>
        <Field label="Tarifa de energia (R$/kWh)" htmlFor="energyRate">
          <input id="energyRate" type="number" step="0.01" min="0" className={cn(inputCls, "font-mono")} {...register("energyRate", { valueAsNumber: true })} />
        </Field>
        <Field label="Complexidade da peça" htmlFor="complexity">
          <div className="relative">
            <Controller
              control={control}
              name="complexity"
              render={({ field }) => (
                <select id="complexity" className={selectCls} value={field.value} onChange={field.onChange}>
                  <option value="simple">Simples — ×1.0</option>
                  <option value="intermediate">Média — ×1.15</option>
                  <option value="high">Alta — ×1.35</option>
                </select>
              )}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </span>
          </div>
        </Field>
      </Grid3>

      <Grid2>
        <Field label="Valor da impressora (R$)" htmlFor="printerValue">
          <input id="printerValue" type="number" step="0.01" min="0" className={cn(inputCls, "font-mono")} {...register("printerValue", { valueAsNumber: true })} />
        </Field>
        <Field label="Vida útil estimada (horas)" htmlFor="printerLifespan" hint="Para calcular desgaste por hora">
          <input id="printerLifespan" type="number" min="1" className={cn(inputCls, "font-mono")} {...register("printerLifespan", { valueAsNumber: true })} />
        </Field>
      </Grid2>
    </FormSection>
  );
};
