import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { SignupFormSchema, singupFormSchema } from "@/lib/types";
import useAuthError from "@/hooks/useAuthError";
import SignupAuthForm from "@/components/SignupAuthForm";
import { authService } from "@/api/services/auth.service";
import { ApiError } from "@/api/errors/ApiError";

export default function Signup() {
  const navigate = useNavigate();
  const { setToken, setIsAuthenticated } = useAuth();
  const { setError } = useAuthError();

  const form = useForm<SignupFormSchema>({
    resolver: zodResolver(singupFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (data: SignupFormSchema) => {
    localStorage.removeItem("accessToken");

    try {
      const response = await authService.signup(
        data.email,
        data.password,
        data.enrollment,
        data.fullName
      );

      localStorage.setItem("accessToken", response.access_token);
      setToken(response.access_token);

      setIsAuthenticated(true);

      navigate("/events");
      return;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        return;
      }

      setError("Erro inesperado ao fazer o cadastro");
    }
  };

  return (
    <>
      <SignupAuthForm onSubmit={handleSubmit} form={form} />

      <p className="text-sky-900">Já tem uma conta?</p>
      <Button
        className="w-full bg-sky-900 text-white hover:bg-sky-800 rounded-2xl"
        onClick={() => navigate("/login")}
      >
        Login
      </Button>
    </>
  );
}
