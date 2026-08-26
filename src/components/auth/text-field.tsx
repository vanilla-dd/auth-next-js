import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function AuthTextField<T extends FieldValues>({
  control,
  name,
  label,
  type,
  autoComplete,
  maxLength,
}: {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  type: "text" | "email" | "password";
  autoComplete: string;
  maxLength?: number;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid || undefined}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            {...field}
            aria-invalid={fieldState.invalid || undefined}
            autoComplete={autoComplete}
            id={name}
            maxLength={maxLength}
            type={type}
          />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}
