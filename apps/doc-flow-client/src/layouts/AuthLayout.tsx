import { Outlet } from "react-router";
import logo from "@/assets/cefet-logo.png";
import { useState, useEffect, createContext } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AuthErrorContextProps {
  setError: (error: string | null) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthErrorContext = createContext<
  AuthErrorContextProps | undefined
>(undefined);

export default function AuthLayout() {
  const [text, setText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const texts = [
      "Acesse seu evento",
      "Crie e adicione eventos",
      "Acesse, crie e adicione eventos",
    ];
    let index = 0;
    const interval = setInterval(() => {
      setText(texts[index]);
      index = index === texts.length - 1 ? 0 : index + 1;
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  }, [error]);

  return (
    <div className="h-fit grid grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col min-h-screen items-center justify-center bg-white p-4">
        <div className="logo">
          <img
            className="mx-auto h-[200px] w-auto object-contain"
            src={logo}
            alt="CEFET/RJ"
          />
        </div>

        <div className="w-full max-w-[400px] space-y-3">
          <h2 className="text-center text-4xl text-sky-900 transition-opacity duration-5000 ease-in-out opacity-0 animate-fade-in-out">
            {text}
          </h2>
          <p className="text-center text-base text-sky-900">
            Acesse, crie e adicione eventos
          </p>
          <AuthErrorContext.Provider value={{ setError }}>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Ah, não</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Outlet />
          </AuthErrorContext.Provider>
        </div>
      </div>
      <div className="hidden md:block bg-sky-900"></div>
    </div>
  );
}
