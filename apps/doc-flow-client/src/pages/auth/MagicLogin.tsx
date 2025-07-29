import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useAuth from "@/hooks/useAuth";
import AuthService from "@/api/services/auth.service";

const authService = new AuthService();

export default function MagicLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuthentication } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Token não fornecido na URL");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await authService.verifyMagicLogin(token);
        
        if (response.access_token) {
          localStorage.setItem("accessToken", response.access_token);
          await checkAuthentication();
          setSuccess(true);
          
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate("/events");
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          return () => clearInterval(timer);
        } else {
          setError("Resposta inválida do servidor");
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Token inválido ou expirado";
        setError(errorMessage);
        console.error("Erro no Magic Login:", error);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, checkAuthentication, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <h1 className="text-2xl font-bold text-sky-900">
                Magic Login
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Autenticação Segura CEFET-RJ
              </p>
            </div>
            
            {loading && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-200 border-t-sky-600"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 bg-sky-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-700 font-medium">
                    Verificando seu token de acesso...
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-sky-500 to-indigo-500 h-2 rounded-full animate-pulse" style={{width: "75%"}}></div>
                  </div>
                </div>
              </div>
            )}

            {success && !loading && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="relative">
                  <div className="text-6xl mb-4 animate-bounce">✅</div>
                  <div className="absolute -top-2 -right-2 text-2xl animate-ping">✨</div>
                </div>
                
                <Alert className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                  <AlertDescription className="text-green-800">
                    <div className="space-y-2">
                      <p className="font-semibold">🎉 Login realizado com sucesso!</p>
                      <p>Redirecionando em <span className="font-bold text-green-600">{countdown}</span> segundos...</p>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="flex justify-center">
                  <Button
                    onClick={() => navigate("/events")}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Acessar Agora →
                  </Button>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="relative">
                  <div className="text-6xl mb-4">❌</div>
                  <div className="absolute -top-1 -right-1 text-lg animate-pulse">⚠️</div>
                </div>
                
                <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50 text-left">
                  <AlertDescription className="text-red-800">
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold">❌ Erro no Magic Login</p>
                        <p className="text-sm mt-1">{error}</p>
                      </div>
                      
                      <div className="border-t border-red-200 pt-3">
                        <p className="font-medium text-sm mb-2">🔍 Possíveis causas:</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>O link expirou (válido por 30 minutos)</li>
                          <li>O link já foi usado anteriormente</li>
                          <li>O token foi modificado ou é inválido</li>
                          <li>Problemas de conectividade</li>
                        </ul>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-gray-500 font-medium">
            DocFlow - Sistema Acadêmico CEFET-RJ
          </p>
          <div className="flex justify-center space-x-4 text-xs text-gray-400">
            <span>🔒 Conexão Segura</span>
            <span>•</span>
            <span>⚡ Acesso Rápido</span>
            <span>•</span>
            <span>🛡️ Sem Senhas</span>
          </div>
        </div>
      </div>
    </div>
  );
} 
 
 