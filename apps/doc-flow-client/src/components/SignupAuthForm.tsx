import { Form, FormField } from "@/components/ui/form";
import { Button } from "./ui/button";
import { SignupFormSchema } from "@/lib/types";
import type { useForm } from "react-hook-form";
import FormItemField from "./FormItemField";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ConfirmPassword from "./ConfirmPassword";
import { Eye, EyeOff } from 'lucide-react';

interface AuthFormProps {
  form: ReturnType<typeof useForm<SignupFormSchema>>;
  onSubmit: (data: SignupFormSchema) => void;
}

export default function SignupAuthForm({ form, onSubmit }: AuthFormProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false)
  const location = useLocation();

  const handleConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value !== form.getValues("password")) {
      form.setError("password", {
        type: "manual",
        message: "As senhas não coincidem",
      });
      return;
    }
    form.clearErrors("password");
  };

  useEffect(() => {
    if (location.pathname === "/signup") {
      setIsRegister(true);
      return;
    }
    setIsRegister(false);
  }, [location]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItemField
              field={field}
              label="Email"
              error={form.formState.errors.email?.message}
              type="email"
              placeholder="exemplo@cefet-rj.br"
            />
          )}
        />
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItemField
              field={field}
              label="Nome completo"
              error={form.formState.errors.fullName?.message}
              type="text"
              placeholder="Jose das Neves"
            />
          )}
        />

        <FormField
          control={form.control}
          name="enrollment"
          render={({ field }) => (
            <FormItemField
              field={field}
              label="Matricula"
              error={form.formState.errors.enrollment?.message}
              type="text"
              placeholder="Matricula"
            />
          )}
        />

        <div className="relative">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItemField
                field={field}
                label="Senha"
                error={form.formState.errors.password?.message}
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
              />
            )}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <ConfirmPassword onchange={handleConfirmPassword} />
        <Button
          className="w-full bg-sky-900 text-white hover:bg-sky-700 rounded-2xl"
          type="submit"
        >
          {isRegister ? "Cadastrar" : "Entrar"}
        </Button>
      </form>
    </Form>
  );
}
