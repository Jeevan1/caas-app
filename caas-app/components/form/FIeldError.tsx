import { AnyFieldApi } from "@tanstack/react-form";
import { AlertCircle } from "lucide-react";

function FieldError({ field }: { field: AnyFieldApi }) {
  const error =
    field.state.meta.isTouched && !field.state.meta.isValid
      ? field.state.meta.errors[0]
      : undefined;

  if (!error) return null;
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-medium text-red-500 leading-none">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {String(error.message)}
    </div>
  );
}

export default FieldError;
