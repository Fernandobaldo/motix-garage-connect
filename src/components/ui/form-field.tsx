
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField = ({ label, error, required = false, children, className }: FormFieldProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className={cn("text-sm font-medium", error && "text-red-600")}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      <FormError message={error} />
    </div>
  );
};
