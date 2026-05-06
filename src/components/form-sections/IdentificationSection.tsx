import { ChangeEvent } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { CalculatorInputs } from "@/types/calculator";
import { FormSection } from "@/components/FormSection";
import { Field, Grid2 } from "@/components/FieldGroup";
import { cn } from "@/lib/utils";
import { Package, ImageIcon } from "lucide-react";
import { inputCls, selectCls } from "./shared";

export const IdentificationSection = ({ setInputs }: { setInputs: (v: any) => void }) => {
  const { register, control, formState: { errors }, watch, setValue, getValues } = useFormContext<CalculatorInputs>();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result?.toString();
      setValue("productImage", b64 as any);
      setInputs({ ...getValues(), productImage: b64 });
    };
    reader.readAsDataURL(file);
  };

  const previewImg = watch("productImage");

  return (
    <FormSection
      title="Identificação da peça"
      description="Cliente, material e quantidade do lote"
      icon={<Package size={17} />}
      iconBg="#DBEAFE"
      iconColor="#1D4ED8"
    >
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
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        </Field>
      </Grid2>

      <Grid2>
        <Field label="Descrição da peça" htmlFor="pieceName" required error={errors.pieceName?.message}>
          <input
            id="pieceName"
            placeholder="Ex: Suporte articulado para celular"
            className={cn(inputCls, errors.pieceName && "border-destructive focus:ring-destructive/20")}
            {...register("pieceName")}
          />
        </Field>

        <Field label="Quantidade no lote" htmlFor="quantity" hint="Total de peças a produzir" error={errors.quantity?.message}>
          <input
            id="quantity"
            type="number"
            min="1"
            className={cn(inputCls, "font-mono")}
            {...register("quantity", { valueAsNumber: true })}
          />
        </Field>
      </Grid2>

      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-3 cursor-pointer px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
          <Controller
            control={control}
            name="manualPainting"
            render={({ field }) => (
              <input type="checkbox" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} className="w-[17px] h-[17px] accent-primary cursor-pointer shrink-0" />
            )}
          />
          <span className="text-[15px] text-foreground">Requer pintura manual</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
          <Controller
            control={control}
            name="roundPrice"
            render={({ field }) => (
              <input type="checkbox" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} className="w-[17px] h-[17px] accent-primary cursor-pointer shrink-0" />
            )}
          />
          <span className="text-[15px] text-foreground">Arredondar preço final para inteiro</span>
        </label>
      </div>

      <Field label="Foto do produto (opcional)" htmlFor="productImage">
        <div className="flex items-center gap-4">
          <label htmlFor="productImage" className="flex items-center gap-2.5 h-12 px-5 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors text-[14px] text-muted-foreground">
            <ImageIcon size={16} />
            Escolher imagem
          </label>
          <input id="productImage" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          {previewImg && <img src={previewImg} alt="preview" className="h-12 w-12 rounded-lg object-cover border border-border" />}
        </div>
      </Field>
    </FormSection>
  );
};
