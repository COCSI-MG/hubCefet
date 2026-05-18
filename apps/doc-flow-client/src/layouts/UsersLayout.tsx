import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Toaster } from "@/components/ui/sonner";
import { UsersSidebar } from "@/components/UsersSidebar";
import { UsersMobileMenu } from "@/components/UsersMobileMenu";

export default function UsersLayout() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col">
        <UsersMobileMenu />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
        <Toaster richColors expand={false} />
        <footer className="bg-sky-900 text-white text-center py-2">
          <p>© {new Date().getFullYear()} Usuários</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      <SidebarProvider>
        <UsersSidebar />
        <SidebarInset className="flex-1 overflow-auto">
          <main className="p-4">
            <Outlet />
          </main>
          <Toaster position="top-center" richColors expand={false} />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
