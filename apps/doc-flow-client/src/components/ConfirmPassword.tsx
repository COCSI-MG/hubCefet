import { Label } from "@radix-ui/react-label";
import React from "react";
import { Input } from "./ui/input";

interface ConfirmPasswordProps {
  onchange: React.ChangeEventHandler<HTMLInputElement>;
}

export default function ConfirmPassword({ ...props }: ConfirmPasswordProps) {
  return (
    <>
      <Label className="text-sm" htmlFor="confirmPassword">
        Confirmar senha
      </Label>
      <Input
        type="password"
        placeholder="Confirmar senha"
        className="rounded-2xl mt-2"
        name="confirmPassword"
        onChange={props.onchange}
      />
    </>
  );
}
