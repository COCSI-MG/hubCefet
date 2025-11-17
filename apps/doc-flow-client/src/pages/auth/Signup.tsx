import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signup } from "@/api/data/auth.data";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { SignupFormSchema, singupFormSchema } from "@/lib/types";
import useAuthError from "@/hooks/useAuthError";
import SignupAuthForm from "@/components/SignupAuthForm";
import { ErrorProcessor } from "@/lib/utils/errorProcessor";

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
      const response = await signup({ ...data });

      if (!response) {
        setError("nao foi possivel criar a conta no momento tente novamente mais tarde")
        return
      }

      localStorage.setItem("accessToken", response.access_token);
      setToken(response.access_token);
      setIsAuthenticated(true);
      navigate("/events");
      return
    } catch (err: any) {
      const processedError = ErrorProcessor.processError(err)

      setError(processedError.message)
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
