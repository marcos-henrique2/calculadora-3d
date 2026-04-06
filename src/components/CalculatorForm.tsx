import { ChangeEvent, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { calculatorSchema } from "@/utils/validation";
import { CalculatorInputs } from "@/types/calculator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calculator,
  Package,
  Zap,
  Wrench,
  TrendingUp,
  ImageIcon,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CalculatorFormProps {
  inputs: CalculatorInputs;
  setInputs: (inputs: CalculatorInputs) => void;
  onCalculate: (data: CalculatorInputs) => void;
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const Section = ({ icon, title, description, children, className }: SectionProps) => (
  <div className={cn("space-y-3", className)}>
    <div className="flex items-center gap-2 pb-2 border-b border-border/60">
      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

const Field = ({ label, htmlFor, hint, error, children, className }: FieldProps) => (
  <div className={cn("space-y-1.5", className)}>
    <Label
      htmlFor={htmlFor}
      className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
    >
      {label}
    </Label>
    {children}
    {hint && !error && (
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Info className="w-3 h-3" />
        {hint}
      </p>
    )}
    {error && <p className="text-xs text-destructive font-medium">{error}</p>}
  </div>
);

const Grid2 = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-2 gap-3">{children}</div>
);

export const CalculatorForm = ({ inputs, setInputs, onCalculate }: CalculatorFormProps) => {
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
    const currentData = getValues();
    if (!file) {
      setValue("productImage" as any, undefined as any);
      setInputs({ ...(currentData as any), productImage: undefined } as any);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result?.toString();
      setValue("productImage" as any, base64 as any);
      setInputs({ ...(currentData as any), productImage: base64 || undefined } as any);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: CalculatorInputs) => {
    setInputs(data);
    onCalculate(data);
  };

  const previewImg: string | undefined = (watch() as any).productImage || (inputs as any).productImage;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-6">
      {/* ── PEÇA ── */}
      <Section
        icon={<Package className="w-3.5 h-3.5" />}
        title="Dados da peça"
        description="Identificação do cliente e do item"
      >
        <Field label="Nome do cliente" htmlFor="clientName">
          <Input
            id="clientName"
            placeholder="Ex: João Silva"
            className="h-9 text-sm"
            {...register("clientName")}
          />
        </Field>

        <Field
          label="Descrição da peça *"
          htmlFor="pieceName"
          error={errors.pieceName?.message as string}
        >
          <Input
            id="pieceName"
            placeholder="Ex: Suporte articulado para celular"
            className="h-9 text-sm"
            {...register("pieceName")}
          />
        </Field>

        <Grid2>
          <Field
            label="Quantidade"
            htmlFor="quantity"
            error={errors.quantity?.message as string}
          >
            <Input
              id="quantity"
              type="number"
              min="1"
              className="h-9 text-sm font-mono"
              {...register("quantity", { valueAsNumber: true })}
            />
          </Field>

          <Field label="Material" htmlFor="material">
            <Controller
              control={control}
              name="material"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="material" className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["PLA", "PETG", "ABS", "TPU", "ASA", "Nylon", "Resina"].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </Grid2>

        <div className="flex items-center gap-2.5 py-1">
          <Controller
            control={control}
            name="manualPainting"
            render={({ field }) => (
              <Checkbox
                id="manualPainting"
                checked={!!field.value}
                onCheckedChange={(v) => field.onChange(!!v)}
              />
            )}
          />
          <Label htmlFor="manualPainting" className="text-sm cursor-pointer font-normal">
            Requer pintura manual
          </Label>
        </div>

        <Field label="Foto do produto (opcional)" htmlFor="productImage">
          <div className="flex items-center gap-3">
            <label
              htmlFor="productImage"
              className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm text-muted-foreground"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Escolher imagem</span>
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
                alt="Preview"
                className="h-10 w-10 rounded-md object-cover border border-border shadow-sm"
              />
            )}
          </div>
        </Field>
      </Section>

      {/* ── IMPRESSÃO ── */}
      <Section
        icon={<Zap className="w-3.5 h-3.5" />}
        title="Parâmetros de impressão"
        description="Filamento, tempo e consumo energético"
      >
        <Grid2>
          <Field label="Filamento (R$/kg)" htmlFor="filamentPrice">
            <Input
              id="filamentPrice"
              type="number"
              step="0.01"
              min="0"
              className="h-9 text-sm font-mono"
              {...register("filamentPrice", { valueAsNumber: true })}
            />
          </Field>
          <Field
            label="Consumo (g) — lote total"
            htmlFor="filamentUsed"
            hint="Total do lote, não por peça"
          >
            <Input
              id="filamentUsed"
              type="number"
              step="0.1"
              min="0"
              className="h-9 text-sm font-mono"
              {...register("filamentUsed", { valueAsNumber: true })}
            />
          </Field>
        </Grid2>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Tempo de impressão — lote total
          </Label>
          <Grid2>
            <div className="relative">
              <Input
                id="printTimeHours"
                type="number"
                min="0"
                placeholder="0"
                className="h-9 text-sm font-mono pr-10"
                {...register("printTimeHours", { valueAsNumber: true })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                h
              </span>
            </div>
            <div className="relative">
              <Input
                id="printTimeMinutes"
                type="number"
                min="0"
                max="59"
                placeholder="0"
                className="h-9 text-sm font-mono pr-10"
                {...register("printTimeMinutes", { valueAsNumber: true })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                min
              </span>
            </div>
          </Grid2>
        </div>

        <Grid2>
          <Field label="Potência da impressora (W)" htmlFor="printerPower">
            <Input
              id="printerPower"
              type="number"
              min="0"
              className="h-9 text-sm font-mono"
              {...register("printerPower", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Tarifa de energia (R$/kWh)" htmlFor="energyRate">
            <Input
              id="energyRate"
              type="number"
              step="0.01"
              min="0"
              className="h-9 text-sm font-mono"
              {...register("energyRate", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Valor da impressora (R$)" htmlFor="printerValue">
            <Input
              id="printerValue"
              type="number"
              step="0.01"
              min="0"
              className="h-9 text-sm font-mono"
              {...register("printerValue", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Vida útil (horas)" htmlFor="printerLifespan">
            <Input
              id="printerLifespan"
              type="number"
              min="1"
              className="h-9 text-sm font-mono"
              {...register("printerLifespan", { valueAsNumber: true })}
            />
          </Field>
        </Grid2>
      </Section>

      {/* ── TRABALHO ── */}
      <Section
        icon={<Wrench className="w-3.5 h-3.5" />}
        title="Trabalho e custos extras"
        description="Mão de obra, acabamento e embalagem"
      >
        <Grid2>
          <Field label="Valor hora/trabalho (R$/h)" htmlFor="hourlyRate">
            <Input
              id="hourlyRate"
              type="number"
              step="0.01"
              min="0"
              className="h-9 text-sm font-mono"
              {...register("hourlyRate", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Tempo de trabalho ativo (h)" htmlFor="activeWorkTime">
            <Input
              id="activeWorkTime"
              type="number"
              step="0.1"
              min="0"
              className="h-9 text-sm font-mono"
              {...register("activeWorkTime", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Acabamento (R$)" htmlFor="finishingCost">
            <Input
              id="finishingCost"
              type="number"
              step="0.01"
              min="0"
              className="h-9 text-sm font-mono"
              {...register("finishingCost", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Manutenção (R$/h de impressão)" htmlFor="maintenanceCost">
            <Input
              id="maintenanceCost"
              type="number"
              step="0.01"
              min="0"
              className="h-9 text-sm font-mono"
              {...register("maintenanceCost", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Embalagem (R$)" htmlFor="packagingCost">
            <Input
              id="packagingCost"
              type="number"
              step="0.01"
              min="0"
              className="h-9 text-sm font-mono"
              {...register("packagingCost", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Custos extras (R$)" htmlFor="extraCost">
            <Input
              id="extraCost"
              type="number"
              step="0.01"
              min="0"
              className="h-9 text-sm font-mono"
              {...register("extraCost", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Taxa de falha/perda (%)" htmlFor="failureRate">
            <Input
              id="failureRate"
              type="number"
              step="0.1"
              min="0"
              max="100"
              className="h-9 text-sm font-mono"
              {...register("failureRate", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Complexidade da peça" htmlFor="complexity">
            <Controller
              control={control}
              name="complexity"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="complexity" className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simples ×1.0</SelectItem>
                    <SelectItem value="intermediate">Média ×1.15</SelectItem>
                    <SelectItem value="high">Alta ×1.35</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </Grid2>
      </Section>

      {/* ── PREÇO ── */}
      <Section
        icon={<TrendingUp className="w-3.5 h-3.5" />}
        title="Precificação"
        description="Margem, taxas e desconto de atacado"
      >
        <Grid2>
          <Field label="Margem de lucro (%)" htmlFor="profitMargin">
            <Input
              id="profitMargin"
              type="number"
              step="1"
              min="0"
              className="h-9 text-sm font-mono"
              {...register("profitMargin", { valueAsNumber: true })}
            />
          </Field>
          <Field
            label="Taxa marketplace (%)"
            htmlFor="additionalFee"
            hint="Mercado Livre, Etsy, etc."
          >
            <Input
              id="additionalFee"
              type="number"
              step="0.1"
              min="0"
              className="h-9 text-sm font-mono"
              {...register("additionalFee", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Desconto atacado (%)" htmlFor="wholesaleDiscount">
            <Input
              id="wholesaleDiscount"
              type="number"
              step="0.1"
              min="0"
              max="100"
              className="h-9 text-sm font-mono"
              {...register("wholesaleDiscount", { valueAsNumber: true })}
            />
          </Field>
          <Field
            label="Preço desejado (R$)"
            htmlFor="desiredPrice"
            hint="Deixe vazio para calcular automaticamente"
          >
            <Input
              id="desiredPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="Opcional"
              className="h-9 text-sm font-mono"
              {...register("desiredPrice", {
                setValueAs: (v) =>
                  v === "" || v === undefined || Number.isNaN(Number(v))
                    ? undefined
                    : Number(v),
              })}
            />
          </Field>
        </Grid2>

        <div className="flex items-center gap-2.5 py-1">
          <Controller
            control={control}
            name="roundPrice"
            render={({ field }) => (
              <Checkbox
                id="roundPrice"
                checked={!!field.value}
                onCheckedChange={(v) => field.onChange(!!v)}
              />
            )}
          />
          <Label htmlFor="roundPrice" className="text-sm cursor-pointer font-normal">
            Arredondar preço final para número inteiro
          </Label>
        </div>
      </Section>

      {/* ── SUBMIT ── */}
      <Button
        type="submit"
        className="w-full h-11 text-base font-medium bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
        size="lg"
      >
        <Calculator className="mr-2 h-4 w-4" />
        Calcular custos
      </Button>
    </form>
  );
};