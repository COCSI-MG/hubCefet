import { Form, FormField } from "@/components/ui/form";
import { Button } from "./ui/button";
import { AuthFormSchema } from "@/lib/types";
import type { useForm } from "react-hook-form";
import FormItemField from "./FormItemField";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

interface AuthFormProps {
  form: ReturnType<typeof useForm<AuthFormSchema>>;
  onSubmit: (data: AuthFormSchema) => void;
}

export default function AuthForm({ form, onSubmit }: AuthFormProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false)
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
                placeholder="senha"
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
