import { Form, FormField } from "@/components/ui/form";
import { Button } from "./ui/button";
import { AuthFormSchema } from "@/lib/types";
import type { useForm } from "react-hook-form";
import FormItemField from "./FormItemField";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

interface AuthFormProps {
  form: ReturnType<typeof useForm<AuthFormSchema>>;
  onSubmit: (data: AuthFormSchema) => void;
}

export default function AuthForm({ form, onSubmit }: AuthFormProps) {
  const [isRegister, setIsRegister] = useState(false);
  const location = useLocation();

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
              placeholder="email"
            />
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItemField
              field={field}
              label="Senha"
              error={form.formState.errors.password?.message}
              type="password"
              placeholder="senha"
            />
          )}
        />
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
