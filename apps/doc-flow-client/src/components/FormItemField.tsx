import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { ControllerRenderProps } from "react-hook-form";

interface FormFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: ControllerRenderProps<any>;
  label: string;
  error: string | undefined;
  type: string;
  placeholder: string;
  step?: string;
}

export default function FormItemField({
  field,
  label,
  error,
  type,
  placeholder,
  step,
}: FormFieldProps) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Input
          className={cn(
            "rounded-2xl bg-white bg-opacity-60",
            error && "border-destructive",
          )}
          type={type}
          placeholder={placeholder}
          step={step}
          {...field}
          required
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
