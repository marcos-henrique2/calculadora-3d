import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

/** Wrapper de campo com label, hint e erro. */
export const Field = ({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: FieldProps) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    <label
      htmlFor={htmlFor}
      className="text-[13px] font-medium text-muted-foreground select-none"
    >
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>

    {children}

    {error && (
      <p className="text-[12px] text-destructive font-medium">{error}</p>
    )}
    {hint && !error && (
      <p className="text-[12px] text-muted-foreground/70">{hint}</p>
    )}
  </div>
);

/** Grid de 2 colunas iguais. */
export const Grid2 = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-5", className)}>{children}</div>
);

/** Grid de 3 colunas iguais. */
export const Grid3 = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5", className)}>{children}</div>
);

/** Par de campos de tempo (horas + minutos). */
export const TimeInput = ({
  idHours,
  idMinutes,
  registerHours,
  registerMinutes,
}: {
  idHours: string;
  idMinutes: string;
  registerHours: object;
  registerMinutes: object;
}) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="relative">
      <input
        id={idHours}
        type="number"
        min="0"
        placeholder="0"
        className="
          w-full h-12 pl-4 pr-12 rounded-lg border border-border bg-white
          text-[16px] text-foreground outline-none
          focus:border-primary focus:ring-2 focus:ring-primary/20
          transition-colors placeholder:text-muted-foreground/50
        "
        {...(registerHours as any)}
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground pointer-events-none">
        h
      </span>
    </div>
    <div className="relative">
      <input
        id={idMinutes}
        type="number"
        min="0"
        max="59"
        placeholder="0"
        className="
          w-full h-12 pl-4 pr-16 rounded-lg border border-border bg-white
          text-[16px] text-foreground outline-none
          focus:border-primary focus:ring-2 focus:ring-primary/20
          transition-colors placeholder:text-muted-foreground/50
        "
        {...(registerMinutes as any)}
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground pointer-events-none">
        min
      </span>
    </div>
  </div>
);
