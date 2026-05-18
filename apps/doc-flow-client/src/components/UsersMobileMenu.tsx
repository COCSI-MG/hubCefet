import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import useAuth from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu } from "lucide-react";
import AppsIcon from '@mui/icons-material/Apps';
import GroupIcon from '@mui/icons-material/Group';

export function UsersMobileMenu() {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [open, setOpen] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const getUserProfile = () => {
      try {
        if (token) {
          const decoded: any = jwtDecode(token);

          let profileName = '';
          if (typeof decoded.profile === 'string') {
            profileName = decoded.profile;
          } else if (decoded.profile?.name) {
            profileName = decoded.profile.name;
          } else if (decoded.profile?.roles && decoded.profile.roles.length > 0) {
            profileName = decoded.profile.roles[0];
          }

          const profileLower = profileName.toLowerCase();
          setIsAdmin(profileLower === 'admin' || profileLower === 'coordinator');
        }
      } catch (err) {
        console.error('Erro ao decodificar token:', err);
      }
    };

    getUserProfile();
  }, [token]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <header className="bg-sky-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Usuários</h1>

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

                {isAdmin && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleNavigation("/users")}
                  >
                    <GroupIcon className="mr-2 h-4 w-4" />
                    Gerenciar Usuários
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
