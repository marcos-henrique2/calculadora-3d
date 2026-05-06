import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { calculatorSchema } from "@/utils/validation";
import { CalculatorInputs } from "@/types/calculator";
import { Calculator } from "lucide-react";

import { IdentificationSection } from "./form-sections/IdentificationSection";
import { PrintParametersSection } from "./form-sections/PrintParametersSection";
import { FinishingSection } from "./form-sections/FinishingSection";
import { PricingSection } from "./form-sections/PricingSection";

interface Props {
  inputs: CalculatorInputs;
  setInputs: (v: CalculatorInputs) => void;
  onCalculate: (data: CalculatorInputs) => void;
}

export const CalculatorForm = ({ inputs, setInputs, onCalculate }: Props) => {
  const methods = useForm<CalculatorInputs>({
    resolver: zodResolver(calculatorSchema as any),
    defaultValues: inputs,
    mode: "onBlur",
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset(inputs);
  }, [inputs, reset]);

  const onSubmit = (data: CalculatorInputs) => {
    setInputs(data);
    onCalculate(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <IdentificationSection setInputs={setInputs} />
        <PrintParametersSection />
        <FinishingSection />
        <PricingSection />

        <button
          type="submit"
          className="
            w-full h-14 rounded-xl bg-primary hover:bg-primary/90
            text-white text-[17px] font-semibold
            flex items-center justify-center gap-3
            transition-all shadow-sm shadow-primary/30
            focus:outline-none focus:ring-2 focus:ring-primary/40
            active:scale-[0.98]
            mb-4
          "
        >
          <Calculator size={20} />
          Calcular custos
        </button>
      </form>
    </FormProvider>
  );
};
