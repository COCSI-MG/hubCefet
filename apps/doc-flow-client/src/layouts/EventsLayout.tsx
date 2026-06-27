import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Toaster } from "@/components/ui/sonner";
import { EventsSidebar } from "@/components/EventsSidebar";
import { EventsMobileMenu } from "@/components/EventsMobileMenu";
import { useEffect } from "react";

export default function EventsLayout() {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) {
      return;
    }

    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    const htmlHeight = document.documentElement.style.height;
    const bodyHeight = document.body.style.height;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";

    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.height = htmlHeight;
      document.body.style.height = bodyHeight;
    };
  }, [isMobile]);

  if (isMobile) {
    return (
      <div className="h-dvh overflow-hidden flex flex-col">
        <EventsMobileMenu />
        <main className="min-h-0 flex-1 overflow-auto overscroll-contain p-4">
          <Outlet />
        </main>
        <Toaster richColors expand={false} />
        <footer className="shrink-0 bg-sky-900 text-white text-center py-2">
          <p>© {new Date().getFullYear()} Eventos</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      <SidebarProvider>
        <EventsSidebar />
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
