"use client";

import * as React from "react";
import { NavUser } from "./NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
} from "@/components/ui/sidebar";
import NavMenuItem from "./NavMenuItem";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { Button } from "./ui/button";
import AppsIcon from '@mui/icons-material/Apps';
import FolderIcon from '@mui/icons-material/Folder';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { Award } from 'lucide-react';
import { Dashboard, RateReview } from '@mui/icons-material';
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export function DocFlowSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, token } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false);
  const [isStudent, setIsStudent] = useState(false);

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
          setIsStudent(profileLower === 'student');
        }
      } catch (err) {
        console.error('Erro ao decodificar token:', err);
      }
    };

    getUserProfile();
  }, [token]);

  return (
    <Sidebar variant="inset" {...props} collapsible="offcanvas">
      <SidebarHeader className="flex items-center justify-between p-4">
        <NavUser
          user={{
            email: user?.email || "Email não encontrado",
            name: user?.fullName || "Nome não encontrado",
            avatar: `/avatars/${user?.fullName.charAt(0).toLowerCase()}.png`,
          }}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="space-y-1">
            <NavMenuItem
              text="Voltar para Apps"
              onClick={() => navigate("/apps")}
              activeNavItem={location.pathname === "/apps"}
              icon={<AppsIcon />}
            />

            <NavMenuItem
              text="Seus Arquivos"
              onClick={() => navigate("/docflow/files")}
              activeNavItem={location.pathname === "/docflow/files"}
              icon={<FolderIcon />}
            />

            {(isAdmin || isProfessor) && (
              <NavMenuItem
                text="Criar Arquivo"
                onClick={() => navigate("/docflow/files/create")}
                activeNavItem={location.pathname === "/docflow/files/create"}
                icon={<CreateNewFolderIcon />}
              />
            )}

            {isStudent && (
              <NavMenuItem
                text="Cadastrar Certificado"
                onClick={() => navigate("/docflow/certificates/create")}
                activeNavItem={location.pathname === "/docflow/certificates/create"}
                icon={<Award />}
              />
            )}

            {isStudent && (
              <NavMenuItem
                text="Dashboard"
                onClick={() => navigate("/docflow/certificates/dashboard")}
                activeNavItem={location.pathname === "/docflow/certificates/dashboard"}
                icon={<Dashboard />}
              />
            )}

            {isProfessor && (
              <NavMenuItem
                text="Avaliar Certificados"
                onClick={() => navigate("/docflow/certificates/review")}
                activeNavItem={location.pathname === "/docflow/certificates/review"}
                icon={<RateReview />}
              />
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button
          className="rounded-2xl bg-sky-900 text-white"
          onClick={() => logout()}
        >
          Sair
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}