import { ChangeEvent, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { calculatorSchema } from "@/utils/validation";
import { CalculatorInputs } from "@/types/calculator";
import { FormSection } from "@/components/FormSection";
import { Field, Grid2, Grid3, TimeInput } from "@/components/FieldGroup";
import { cn } from "@/lib/utils";
import {
  Package,
  Layers,
  Wrench,
  DollarSign,
  Calculator,
  ImageIcon,
} from "lucide-react";

/* ── classes base ── */
const inputCls = `
  w-full h-12 px-4 rounded-lg border border-border bg-white
  text-[16px] text-foreground outline-none
  focus:border-primary focus:ring-2 focus:ring-primary/20
  transition-colors placeholder:text-muted-foreground/50
`;
const selectCls = `
  w-full h-12 px-4 rounded-lg border border-border bg-white
  text-[16px] text-foreground outline-none appearance-none cursor-pointer
  focus:border-primary focus:ring-2 focus:ring-primary/20
  transition-colors
`;

interface Props {
  inputs: CalculatorInputs;
  setInputs: (v: CalculatorInputs) => void;
  onCalculate: (data: CalculatorInputs) => void;
}

export const CalculatorForm = ({ inputs, setInputs, onCalculate }: Props) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    getValues,
    formState: { errors },
  } = useForm<CalculatorInputs>({
    resolver: zodResolver(calculatorSchema as any),
    defaultValues: inputs,
    mode: "onBlur",
  });

  useEffect(() => {
    reset(inputs);
  }, [inputs, reset]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result?.toString();
      setValue("productImage" as any, b64 as any);
      setInputs({ ...getValues(), productImage: b64 } as any);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: CalculatorInputs) => {
    setInputs(data);
    onCalculate(data);
  };

  const previewImg: string | undefined =
    (watch() as any).productImage || (inputs as any).productImage;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>

      {/* ══════════════════════════════════════
          1. IDENTIFICAÇÃO DA PEÇA
      ══════════════════════════════════════ */}
      <FormSection
        title="Identificação da peça"
        description="Cliente, material e quantidade do lote"
        icon={<Package size={17} />}
        iconBg="#DBEAFE"
        iconColor="#1D4ED8"
      >
        {/* Linha 1: cliente + material */}
        <Grid2>
          <Field label="Nome do cliente" htmlFor="clientName">
            <input
              id="clientName"
              placeholder="Ex: João Silva"
              className={inputCls}
              {...register("clientName")}
            />
          </Field>

          <Field label="Material utilizado" htmlFor="material">
            <div className="relative">
              <select id="material" className={selectCls} {...register("material")}>
                {["PLA", "PETG", "ABS", "ASA", "TPU", "Nylon", "Resina"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              {/* seta select */}
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
          </Field>
        </Grid2>

        {/* Linha 2: descrição + quantidade */}
        <Grid2>
          <Field
            label="Descrição da peça"
            htmlFor="pieceName"
            required
            error={errors.pieceName?.message as string}
          >
            <input
              id="pieceName"
              placeholder="Ex: Suporte articulado para celular"
              className={cn(inputCls, errors.pieceName && "border-destructive focus:ring-destructive/20")}
              {...register("pieceName")}
            />
          </Field>

          <Field
            label="Quantidade no lote"
            htmlFor="quantity"
            hint="Total de peças a produzir"
            error={errors.quantity?.message as string}
          >
            <input
              id="quantity"
              type="number"
              min="1"
              className={cn(inputCls, "font-mono")}
              {...register("quantity", { valueAsNumber: true })}
            />
          </Field>
        </Grid2>

        {/* Opções de check */}
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            <Controller
              control={control}
              name="manualPainting"
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="w-[17px] h-[17px] accent-primary cursor-pointer shrink-0"
                />
              )}
            />
            <span className="text-[15px] text-foreground">Requer pintura manual</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            <Controller
              control={control}
              name="roundPrice"
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="w-[17px] h-[17px] accent-primary cursor-pointer shrink-0"
                />
              )}
            />
            <span className="text-[15px] text-foreground">Arredondar preço final para inteiro</span>
          </label>
        </div>

        {/* Foto do produto */}
        <Field label="Foto do produto (opcional)" htmlFor="productImage">
          <div className="flex items-center gap-4">
            <label
              htmlFor="productImage"
              className="flex items-center gap-2.5 h-12 px-5 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors text-[14px] text-muted-foreground"
            >
              <ImageIcon size={16} />
              Escolher imagem
            </label>
            <input
              id="productImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {previewImg && (
              <img
                src={previewImg}
                alt="preview"
                className="h-12 w-12 rounded-lg object-cover border border-border"
              />
            )}
          </div>
        </Field>
      </FormSection>

      {/* ══════════════════════════════════════
          2. FILAMENTO E IMPRESSÃO
      ══════════════════════════════════════ */}
      <FormSection
        title="Filamento e impressão"
        description="Material consumido, tempo e parâmetros da máquina"
        icon={<Layers size={17} />}
        iconBg="#DCFCE7"
        iconColor="#166534"
      >
        {/* Filamento */}
        <Grid2>
          <Field label="Preço do filamento (R$/kg)" htmlFor="filamentPrice">
            <input
              id="filamentPrice"
              type="number"
              step="0.01"
              min="0"
              className={cn(inputCls, "font-mono")}
              {...register("filamentPrice", { valueAsNumber: true })}
            />
          </Field>

          <Field
            label="Filamento consumido (g) — lote total"
            htmlFor="filamentUsed"
            hint="Peso total gasto no lote inteiro"
          >
            <input
              id="filamentUsed"
              type="number"
              step="0.1"
              min="0"
              className={cn(inputCls, "font-mono")}
              {...register("filamentUsed", { valueAsNumber: true })}
            />
          </Field>
        </Grid2>

        {/* Tempo de impressão */}
        <Field label="Tempo de impressão do lote completo" htmlFor="printTimeHours">
          <TimeInput
            idHours="printTimeHours"
            idMinutes="printTimeMinutes"
            registerHours={register("printTimeHours", { valueAsNumber: true })}
            registerMinutes={register("printTimeMinutes", { valueAsNumber: true })}
          />
        </Field>

        {/* Impressora: potência / energia / complexidade */}
        <Grid3>
          <Field label="Potência da impressora (W)" htmlFor="printerPower">
            <input
              id="printerPower"
              type="number"
              min="0"
              className={cn(inputCls, "font-mono")}
              {...register("printerPower", { valueAsNumber: true })}
            />
          </Field>

          <Field label="Tarifa de energia (R$/kWh)" htmlFor="energyRate">
            <input
              id="energyRate"
              type="number"
              step="0.01"
              min="0"
              className={cn(inputCls, "font-mono")}
              {...register("energyRate", { valueAsNumber: true })}
            />
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
          </Field>
        </Grid3>

        {/* Impressora: valor / vida útil */}
        <Grid2>
          <Field label="Valor da impressora (R$)" htmlFor="printerValue">
            <input
              id="printerValue"
              type="number"
              step="0.01"
              min="0"
              className={cn(inputCls, "font-mono")}
              {...register("printerValue", { valueAsNumber: true })}
            />
          </Field>

          <Field
            label="Vida útil estimada (horas)"
            htmlFor="printerLifespan"
            hint="Para calcular desgaste por hora"
          >
            <input
              id="printerLifespan"
              type="number"
              min="1"
              className={cn(inputCls, "font-mono")}
              {...register("printerLifespan", { valueAsNumber: true })}
            />
          </Field>
        </Grid2>
      </FormSection>

      {/* ══════════════════════════════════════
          3. TRABALHO E ACABAMENTO
      ══════════════════════════════════════ */}
      <FormSection
        title="Trabalho e acabamento"
        description="Mão de obra, manutenção, embalagem e perdas"
        icon={<Wrench size={17} />}
        iconBg="#FEF3C7"
        iconColor="#92400E"
      >
        {/* Mão de obra */}
        <Grid2>
          <Field label="Valor hora de trabalho (R$/h)" htmlFor="hourlyRate">
            <input
              id="hourlyRate"
              type="number"
              step="0.01"
              min="0"
              className={cn(inputCls, "font-mono")}
              {...register("hourlyRate", { valueAsNumber: true })}
            />
          </Field>

          <Field
            label="Tempo de trabalho ativo (h)"
            htmlFor="activeWorkTime"
            hint="Horas que você atua manualmente"
          >
            <input
              id="activeWorkTime"
              type="number"
              step="0.1"
              min="0"
              className={cn(inputCls, "font-mono")}
              {...register("activeWorkTime", { valueAsNumber: true })}
            />
          </Field>
        </Grid2>

        {/* Acabamento + Manutenção + Falha */}
        <Grid3>
          <Field label="Custo de acabamento (R$)" htmlFor="finishingCost">
            <input
              id="finishingCost"
              type="number"
              step="0.01"
              min="0"
              className={cn(inputCls, "font-mono")}
              {...register("finishingCost", { valueAsNumber: true })}
            />
          </Field>

          <Field
            label="Manutenção (R$/h de impressão)"
            htmlFor="maintenanceCost"
          >
            <input
              id="maintenanceCost"
              type="number"
              step="0.01"
              min="0"
              className={cn(inputCls, "font-mono")}
              {...register("maintenanceCost", { valueAsNumber: true })}
            />
          </Field>

          <Field label="Taxa de falha / perda (%)" htmlFor="failureRate">
            <input
              id="failureRate"
              type="number"
              step="0.1"
              min="0"
              max="100"
              className={cn(inputCls, "font-mono")}
              {...register("failureRate", { valueAsNumber: true })}
            />
          </Field>
        </Grid3>

        {/* Embalagem + Extras */}
        <Grid2>
          <Field label="Embalagem (R$)" htmlFor="packagingCost">
            <input
              id="packagingCost"
              type="number"
              step="0.01"
              min="0"
              className={cn(inputCls, "font-mono")}
              {...register("packagingCost", { valueAsNumber: true })}
            />
          </Field>

          <Field label="Outros custos extras (R$)" htmlFor="extraCost">
            <input
              id="extraCost"
              type="number"
              step="0.01"
              min="0"
              className={cn(inputCls, "font-mono")}
              {...register("extraCost", { valueAsNumber: true })}
            />
          </Field>
        </Grid2>
      </FormSection>

      {/* ══════════════════════════════════════
          4. MARGEM E PRECIFICAÇÃO
      ══════════════════════════════════════ */}
      <FormSection
        title="Margem e precificação"
        description="Lucro desejado, taxas de marketplace e atacado"
        icon={<DollarSign size={17} />}
        iconBg="#EDE9FE"
        iconColor="#4C1D95"
      >
        {/* Margem + Taxa */}
        <Grid2>
          <Field label="Margem de lucro (%)" htmlFor="profitMargin">
            <input
              id="profitMargin"
              type="number"
              step="1"
              min="0"
              className={cn(inputCls, "font-mono")}
              {...register("profitMargin", { valueAsNumber: true })}
            />
          </Field>

          <Field
            label="Taxa marketplace (%)"
            htmlFor="additionalFee"
            hint="Mercado Livre, Etsy, etc."
          >
            <input
              id="additionalFee"
              type="number"
              step="0.1"
              min="0"
              className={cn(inputCls, "font-mono")}
              {...register("additionalFee", { valueAsNumber: true })}
            />
          </Field>
        </Grid2>

        {/* Atacado + Preço desejado */}
        <Grid2>
          <Field
            label="Desconto para atacado (%)"
            htmlFor="wholesaleDiscount"
            hint="0 = sem preço de atacado"
          >
            <input
              id="wholesaleDiscount"
              type="number"
              step="0.1"
              min="0"
              max="100"
              className={cn(inputCls, "font-mono")}
              {...register("wholesaleDiscount", { valueAsNumber: true })}
            />
          </Field>

          <Field
            label="Preço desejado — opcional (R$)"
            htmlFor="desiredPrice"
            hint="Deixe vazio para calcular automaticamente"
          >
            <input
              id="desiredPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 50,00"
              className={cn(inputCls, "font-mono")}
              {...register("desiredPrice", {
                setValueAs: (v) =>
                  v === "" || v == null || isNaN(Number(v)) ? undefined : Number(v),
              })}
            />
          </Field>
        </Grid2>
      </FormSection>

      {/* ══════════════════════════════════════
          BOTÃO CALCULAR
      ══════════════════════════════════════ */}
      <button
        type="submit"
        className="
          w-full h-14 rounded-xl bg-primary hover:bg-primary/90
          text-white text-[17px] font-semibold
          flex items-center justify-center gap-3
          transition-colors shadow-sm shadow-primary/30
          focus:outline-none focus:ring-2 focus:ring-primary/40
          mb-4
        "
      >
        <Calculator size={20} />
        Calcular custos
      </button>
    </form>
  );
};
