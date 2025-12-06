import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import AuthForm from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authFormSchema, type AuthFormSchema } from "@/lib/types";
import useAuthError from "@/hooks/useAuthError";
import AuthService from "@/api/services/auth.service";
import { Separator } from "@/components/ui/separator";
import { ErrorProcessor } from "@/lib/utils/errorProcessor";

const authService = new AuthService();

export default function Login() {
  const navigate = useNavigate();
  const { checkAuthentication } = useAuth();
  const { setError } = useAuthError();

  const [showMagicLogin, setShowMagicLogin] = useState(false);
  const [magicEmail, setMagicEmail] = useState("");
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicMessage, setMagicMessage] = useState("");
  const [magicError, setMagicError] = useState("");

  const form = useForm<AuthFormSchema>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (data: AuthFormSchema) => {
    try {
      const response = await authService.signin(data.email, data.password);

      if (!response) {
        setError("nao foi possivel fazer login no momento tente novamente mais tarde")
        return
      }

      localStorage.setItem("accessToken", response.access_token);
      await checkAuthentication();
      navigate("/events");
    } catch (err: any) {
      const processedError = ErrorProcessor.processError(err)

      setError(processedError.message)
    }
  };

  const handleMagicLogin = async () => {
    if (!magicEmail) {
      setMagicError("Email é obrigatório");
      return;
    }

    try {
      setMagicLoading(true);
      setMagicError("");
      setMagicMessage("");

      const response = await authService.requestMagicLogin(magicEmail);
      setMagicMessage(response.message);
    } catch (error: any) {
      setMagicError(error.response?.data?.message || "Erro ao enviar magic link");
    } finally {
      setMagicLoading(false);
    }
  };

  return (
    <>
      {!showMagicLogin ? (
        <>
          <AuthForm onSubmit={handleSubmit} form={form} />

          <div className="flex items-center my-4">
            <Separator className="flex-1" />
            <span className="mx-3 text-sm text-gray-500">ou</span>
            <Separator className="flex-1" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-sky-900 text-sky-900 hover:bg-sky-50 rounded-2xl"
            onClick={() => setShowMagicLogin(true)}
          >
            🔐 Acesso sem Senha
          </Button>

          <p className="text-sky-900 mt-4">Não possui conta?</p>
          <Button
            className="w-full bg-sky-900 text-white hover:bg-sky-800 rounded-2xl"
            onClick={() => navigate("/signup")}
          >
            Cadastrar
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-sky-900 mb-2">
                🔐 Acesso sem Senha
              </h2>
              <p className="text-sm text-gray-600">
                Digite seu email de estudante e receba um link de acesso
              </p>
            </div>

            <div className="space-y-3">
              <Input
                type="email"
                placeholder="seu.email@cefet-rj.br ou seu.email@aluno.cefet-rj.br"
                value={magicEmail}
                onChange={(e) => setMagicEmail(e.target.value)}
                disabled={magicLoading}
                className="rounded-2xl"
              />

              <Button
                onClick={handleMagicLogin}
                disabled={magicLoading || !magicEmail}
                className="w-full bg-sky-900 text-white hover:bg-sky-800 rounded-2xl"
              >
                {magicLoading ? "Enviando..." : "Enviar Link de Acesso"}
              </Button>
            </div>

            {magicMessage && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  {magicMessage}
                </AlertDescription>
              </Alert>
            )}

            {magicError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {magicError}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowMagicLogin(false);
                setMagicEmail("");
                setMagicMessage("");
                setMagicError("");
              }}
              className="w-full text-sky-900 hover:bg-sky-50 rounded-2xl"
            >
              ← Voltar ao Login Normal
            </Button>
          </div>
        </>
      )}
    </>
  );
}
