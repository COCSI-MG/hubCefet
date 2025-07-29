import { Outlet } from "react-router-dom";
import { Toaster } from "../components/ui/sonner";

export default function DefaultLayout() {
  return (
    <div className="h-screen flex flex-col">
      <main className="flex-1 overflow-auto p-4">
        <Outlet />
      </main>
      <Toaster position="top-center" richColors expand={false} />
      <footer className="bg-sky-900 text-white text-center py-2">
        <p>© {new Date().getFullYear()} DocFlow</p>
      </footer>
    </div>
  );
}
