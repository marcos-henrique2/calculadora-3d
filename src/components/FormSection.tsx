import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
  className?: string;
}

/** Agrupa campos do formulário numa seção com cabeçalho visual. */
export const FormSection = ({
  title,
  description,
  icon,
  iconBg,
  iconColor,
  children,
  className,
}: FormSectionProps) => (
  <section className={cn("mb-10", className)}>
    {/* Cabeçalho da seção */}
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-[15px] font-semibold text-foreground leading-none">
          {title}
        </h3>
        <p className="text-[13px] text-muted-foreground mt-1">{description}</p>
      </div>
    </div>

    {/* Campos */}
    <div className="space-y-5">{children}</div>
  </section>
);
