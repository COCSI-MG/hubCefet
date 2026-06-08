import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/useProfile";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu, Award } from "lucide-react";
import AppsIcon from '@mui/icons-material/Apps';
import { AccessAlarm, Dashboard, RateReview } from '@mui/icons-material';
import ExtensionIcon from '@mui/icons-material/Extension';

export function DocFlowMobileMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);

  const profileLower = String(profile).toLowerCase();
  const isAdmin = profileLower === 'admin' || profileLower === 'coordinator';
  const isProfessor = profileLower === 'professor';
  const isStudent = profileLower === 'student';

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <header className="bg-sky-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">DocFlow</h1>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <div className="flex flex-col h-full">
            <div className="flex-1 py-4">
              <nav className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleNavigation("/apps")}
                >
                  <AppsIcon className="mr-2 h-4 w-4" />
                  Voltar para Apps
                </Button>

                {isStudent && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleNavigation("/docflow/certificates/create")}
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Cadastrar Certificado
                  </Button>
                )}

                {isStudent && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleNavigation("/docflow/certificates/dashboard")}
                  >
                    <Dashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                )}

                {isProfessor && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleNavigation("/docflow/certificates/review")}
                  >
                    <RateReview className="mr-2 h-4 w-4" />
                    Avaliar Certificados
                  </Button>
                )}

                {isAdmin && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleNavigation("/docflow/complementary")}
                  >
                    <AccessAlarm className="mr-2 h-4 w-4" />
                    Horas Complementares
                  </Button>
                )}

                {isAdmin && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleNavigation("/docflow/extension")}
                  >
                    <ExtensionIcon className="mr-2 h-4 w-4" />
                    Horas de Extensão
                  </Button>
                )}
              </nav>
            </div>

            <div className="border-t pt-4">
              <div className="mb-4 text-sm">
                <p className="font-medium">{user?.fullName || "Nome não encontrado"}</p>
                <p className="text-muted-foreground">{user?.email || "Email não encontrado"}</p>
              </div>
              <Button
                className="w-full bg-sky-900 text-white"
                onClick={() => logout()}
              >
                Sair
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
