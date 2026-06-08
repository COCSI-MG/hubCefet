import { Label } from "@radix-ui/react-label";
import React, { Dispatch, SetStateAction } from "react";
import { Input } from "./ui/input";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmPasswordProps {
  onchange?: React.ChangeEventHandler<HTMLInputElement>;
  showPassword: boolean;
  setShowPassword: Dispatch<SetStateAction<boolean>>;
  field?: any;
  error?: string;
}

export default function ConfirmPassword({ field, error, onchange, ...props }: ConfirmPasswordProps) {
  return (
    <div className="relative space-y-2">
      <Label className="text-sm font-medium leading-none" htmlFor="confirmPassword">
        Confirmar senha
      </Label>
      <div className="relative">
        <Input
          type={props.showPassword ? "text" : "password"}
          placeholder="Confirmar senha"
          className={cn("rounded-2xl mt-2", error && "border-destructive")}
          name="confirmPassword"
          onChange={onchange}
          {...field}
          required
        />

        <button
          type="button"
          onClick={() => props.setShowPassword(prev => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 text-gray-500 hover:text-gray-700"
        >
          {props.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}
    </div>
  );
}
