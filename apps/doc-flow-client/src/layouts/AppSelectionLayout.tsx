import { AppSelectionMobileMenu } from "@/components/AppSelectionMobileMenu";
import { AppSelectionSidebar } from "@/components/AppSelectionSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

export default function AppSelecionLayout() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col">
        <AppSelectionMobileMenu />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
        <Toaster richColors expand={false} />
        <footer className="bg-sky-900 text-white text-center py-2">
          <p>© {new Date().getFullYear()} DocFlow</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      <SidebarProvider>
        <AppSelectionSidebar />
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
