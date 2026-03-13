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

export function ProfileSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();


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
