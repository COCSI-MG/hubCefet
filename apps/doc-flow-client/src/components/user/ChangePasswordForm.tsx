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
import { authService } from "@/api/services/auth.service";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { ApiError } from "@/api/errors/ApiError";
import { Lock } from "lucide-react";

export default function ChangePasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const tempToken = location.state?.tempToken;

  const form = useForm<ChangePasswordType>({
    resolver: zodResolver(changePassowrdSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });



  const handleFormSubmit: SubmitHandler<ChangePasswordType> = async (
    data: ChangePasswordType,
  ) => {
    try {
      await authService.changePassword(data, tempToken);

      toast.success("Senha alterada com sucesso");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }

      toast.error("Ocorreu um erro ao alterar a senha, por favor tente novamente");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="w-full max-w-md mx-auto">
        <div className="bg-white border border-gray-100 shadow-lg sm:shadow-xl rounded-[2rem] p-8 sm:p-10 space-y-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center shadow-sm">
              <Lock size={32} strokeWidth={1.5} />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-2xl font-semibold text-gray-800">Criar nova senha</h2>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Sua nova senha deve ser diferente das senhas utilizadas anteriormente.
              </p>
            </div>
          </div>
          
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItemField
                  field={field}
                  label="Nova senha"
                  error={form.formState.errors.newPassword?.message}
                  type="password"
                  placeholder="Mudar@123"
                />
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <ConfirmPassword
                  field={field}
                  error={form.formState.errors.confirmPassword?.message}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white shadow-md hover:shadow-lg transition-all py-6 text-[15px] rounded-2xl font-medium"
          >
            Redefinir Senha
          </Button>
        </div>
      </form>
    </Form>
  );
}
