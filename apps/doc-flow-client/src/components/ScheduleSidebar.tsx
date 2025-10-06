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
import AppsIcon from "@mui/icons-material/Apps";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SettingsIcon from "@mui/icons-material/Settings";
import ViewListIcon from "@mui/icons-material/ViewList";
import PeopleIcon from "@mui/icons-material/People";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export function ScheduleSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, token } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false);

  useEffect(() => {
    const getUserProfile = () => {
      try {
        if (token) {
          const decoded: any = jwtDecode(token);

          let profileName = "";
          if (typeof decoded.profile === "string") {
            profileName = decoded.profile;
          } else if (decoded.profile?.name) {
            profileName = decoded.profile.name;
          } else if (
            decoded.profile?.roles &&
            decoded.profile.roles.length > 0
          ) {
            profileName = decoded.profile.roles[0];
          }

          const profileLower = profileName.toLowerCase();

          setIsAdmin(
            profileLower === "admin" || profileLower === "coordinator"
          );
          setIsProfessor(profileLower === "professor");
        }
      } catch (err) {
        console.error("Erro ao decodificar token:", err);
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
              text="Todos os Horários"
              onClick={() => navigate("/horarios/todos")}
              activeNavItem={location.pathname === "/horarios/todos"}
              icon={<ViewListIcon />}
            />

            {!isAdmin && (
              <NavMenuItem
                text="Meus Horários"
                onClick={() => navigate("/horarios")}
                activeNavItem={location.pathname === "/horarios"}
                icon={<ScheduleIcon />}
              />
            )}

            {(isAdmin || isProfessor) && (
              <NavMenuItem
                text="Gestão do Sistema"
                onClick={() => navigate("/horarios/gerenciar")}
                activeNavItem={location.pathname === "/horarios/gerenciar"}
                icon={<SettingsIcon />}
              />
            )}

            {isAdmin && (
              <NavMenuItem
                text="Gerenciar Usuários"
                onClick={() => navigate("/horarios/gerenciar/usuarios")}
                activeNavItem={
                  location.pathname === "/horarios/gerenciar/usuarios" ||
                  location.pathname === "/horarios/gerenciar/usuarios/criar" ||
                  location.pathname.startsWith(
                    "/horarios/gerenciar/usuarios/editar"
                  )
                }
                icon={<PeopleIcon />}
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
