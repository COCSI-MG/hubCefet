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
import EventIcon from "@mui/icons-material/Event";
import AddIcon from "@mui/icons-material/Add";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export function EventsSidebar({
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

            {(isAdmin || isProfessor) && (
              <NavMenuItem
                text="Criar Evento"
                onClick={() => navigate("/events/create")}
                activeNavItem={location.pathname === "/events/create"}
                icon={<AddIcon />}
              />
            )}

            <NavMenuItem
              text="Todos Eventos"
              onClick={() => navigate("/events/all")}
              activeNavItem={location.pathname === "/events/all"}
              icon={<EventIcon />}
            />
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
