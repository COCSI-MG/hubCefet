import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import FormItemField from "@/components/FormItemField";
import {
  changePassowrdSchema,
  ChangePassword as ChangePasswordType,
} from "@/lib/schemas/auth/change-password.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import ConfirmPassword from "@/components/ConfirmPassword";
import { changePassword } from "@/api/data/auth.data";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export default function ChangePasswordForm() {
  const navigate = useNavigate();

  const form = useForm<ChangePasswordType>({
    resolver: zodResolver(changePassowrdSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  });

  const handleConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value !== form.getValues("newPassword")) {
      form.setError("newPassword", {
        type: "manual",
        message: "As senhas não coincidem",
      });
      return;
    }
    form.clearErrors("newPassword");
  };

  const handleFormSubmit: SubmitHandler<ChangePasswordType> = async (
    data: ChangePasswordType,
  ) => {
    const result = await changePassword({ ...data });
    if (result) {
      toast.error(
        "Ocorreu um erro ao alterar a senha, por favor tente novamente",
      );
      form.reset();
      return;
    }

    toast.success("Senha alterada com sucesso");
    navigate("/profile");
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <div className="space-y-6 min-w-96 max-md:min-w-24 border rounded-xl p-6 bg-white">
            <div>
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItemField
                    field={field}
                    label="Senha atual"
                    error={form.formState.errors.oldPassword?.message}
                    type="password"
                    placeholder="123@@@@mudar"
                  />
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItemField
                    field={field}
                    label="Nova senha"
                    error={form.formState.errors.newPassword?.message}
                    type="password"
                    placeholder="123@@@@@mudar"
                  />
                )}
              />
            </div>
            <div>
              <ConfirmPassword onchange={handleConfirmPassword} />
            </div>
            <div>
              <Button
                type="submit"
                className="w-full bg-sky-900 text-white hover:bg-sky-700 rounded-2xl"
              >
                Salvar
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}
