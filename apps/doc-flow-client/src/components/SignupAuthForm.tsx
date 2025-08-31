import { Form, FormField } from "@/components/ui/form";
import { Button } from "./ui/button";
import { SignupFormSchema } from "@/lib/types";
import type { useForm } from "react-hook-form";
import FormItemField from "./FormItemField";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Label } from "./ui/label";
import { getProfileId } from "../api/data/profile.data";
import ConfirmPassword from "./ConfirmPassword";

interface AuthFormProps {
  form: ReturnType<typeof useForm<SignupFormSchema>>;
  onSubmit: (data: SignupFormSchema) => void;
}

export default function SignupAuthForm({ form, onSubmit }: AuthFormProps) {
  const [isRegister, setIsRegister] = useState(false);
  const location = useLocation();

  const [role, setRole] = useState<string>("");
  const [profileId, setProfileId] = useState<string>("");

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
    if (role) {
      getProfileId(role, { limit: 10, offset: 0 }).then((id) => {
        if (id) {
          setProfileId(id);
          form.setValue("profileId", id);
        }
      });
    }
  }, [role]);

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
              placeholder="matricula"
            />
          )}
        />

        <div>
          <Label>Você é:</Label>
          <select
            className="w-full border rounded-md p-2"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setProfileId("");
            }}
          >
            <option value="">Selecione...</option>
            <option value="student">Aluno</option>
            <option value="admin">Professor</option>
          </select>
        </div>

        <FormField
          control={form.control}
          name="profileId"
          render={({ field }) => (
            <div className="hidden">
              <Label>Perfil Selecionado:</Label>
              <select
                {...field}
                className="w-full border rounded-md p-2"
                disabled
              >
                {profileId ? (
                  <option value={profileId}>
                    Perfil encontrado ({profileId})
                  </option>
                ) : (
                  <option value="">
                    Selecione um tipo de usuário primeiro
                  </option>
                )}
              </select>
              {form.formState.errors.profileId && (
                <p className="text-red-500">
                  {form.formState.errors.profileId.message}
                </p>
              )}
            </div>
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
