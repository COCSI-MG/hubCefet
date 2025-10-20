import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ControllerRenderProps } from "react-hook-form";

interface FormFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: ControllerRenderProps<any>;
  label?: string;
  error: string | undefined;
  type: string | "textarea";
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
  const isTextarea = type === "textarea";

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        {isTextarea ? (
          <Textarea
            className={cn(
              "rounded-2xl bg-white bg-opacity-60",
              error && "border-destructive"
            )}
            placeholder={placeholder}
            {...field}
            required
          />
        ) : (
          <Input
            className={cn(
              "rounded-2xl bg-white bg-opacity-60",
              error && "border-destructive"
            )}
            type={type}
            placeholder={placeholder}
            step={step}
            {...field}
            required
          />
        )}
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
