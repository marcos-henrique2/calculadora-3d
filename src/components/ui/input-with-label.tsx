import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputWithLabelProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

const InputWithLabel = React.forwardRef<HTMLInputElement, InputWithLabelProps>(({ label, id, error, ...props }, ref) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        {...props}
        ref={ref}
        className={error ? "border-destructive" : ""}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
});

InputWithLabel.displayName = 'InputWithLabel';

export { InputWithLabel };
