import { Input } from "../ui/input";
import React from "react";

export function DebouncedInput({
  placeholder,
  value: initialValue,
  onChange,
  debounce = 500,
  numericOnly = false,
  ...props
}: {
  placeholder: string;
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
  numericOnly?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <Input
      placeholder={placeholder}
      value={value}
      inputMode={numericOnly ? "numeric" : undefined}
      pattern={numericOnly ? "[0-9]*" : undefined}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
