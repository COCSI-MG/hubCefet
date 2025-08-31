"use client";

import * as React from "react";
import { Link } from "react-router-dom";
import { Menu, User, Calendar, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import useAuth from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function ScheduleMobileMenu() {
  const [open, setOpen] = useState(false);
  const { token } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false);

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
          setIsProfessor(profileLower === 'professor');
        }
      } catch (err) {
        console.error('Erro ao decodificar token:', err);
      }
    };

    getUserProfile();
  }, [token]);

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-background border-b">
      <div className="flex items-center space-x-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="top" className="w-full h-auto">
            <nav className="flex flex-col space-y-4 pt-4">
              <Link
                to={`/apps`}
                className="flex items-center space-x-2 text-sm font-medium"
                onClick={() => setOpen(false)}
              >
                <Menu className="h-5 w-5" />
                <span>Voltar para Apps</span>
              </Link>

              {!isAdmin && (
                <Link
                  to={`/horarios`}
                  className="flex items-center space-x-2 text-sm font-medium"
                  onClick={() => setOpen(false)}
                >
                  <Calendar className="h-5 w-5" />
                  <span>Meus Horários</span>
                </Link>
              )}

              {(isAdmin || isProfessor) && (
                <Link
                  to={`/horarios/gerenciar`}
                  className="flex items-center space-x-2 text-sm font-medium"
                  onClick={() => setOpen(false)}
                >
                  <Settings className="h-5 w-5" />
                  <span>Gestão do Sistema</span>
                </Link>
              )}

              <Link
                to={`/profile`}
                className="flex items-center space-x-2 text-sm font-medium"
                onClick={() => setOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>Perfil</span>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
      <Calendar />
    </header>
  );
}