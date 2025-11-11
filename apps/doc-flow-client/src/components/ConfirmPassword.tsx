import { Label } from "@radix-ui/react-label";
import React, { Dispatch, SetStateAction } from "react";
import { Input } from "./ui/input";
import { Eye, EyeOff } from "lucide-react";

interface ConfirmPasswordProps {
  onchange: React.ChangeEventHandler<HTMLInputElement>;
  showPassword: boolean
  setShowPassword: Dispatch<SetStateAction<boolean>>
}

export default function ConfirmPassword({ ...props }: ConfirmPasswordProps) {
  return (
    <div className="relative">
      <Label className="text-sm" htmlFor="confirmPassword">
        Confirmar senha
      </Label>
      <Input
        type={props.showPassword ? "text" : "password"}
        placeholder="Confirmar senha"
        className="rounded-2xl mt-2"
        name="confirmPassword"
        onChange={props.onchange}
      />

      <button
        type="button"
        onClick={() => props.setShowPassword(prev => !prev)}
        className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
      >
        {props.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>

    </div>
  );
}
