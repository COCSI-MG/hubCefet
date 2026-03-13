import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu } from "lucide-react";

export function AppSelectionMobileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-sky-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">DocFlow</h1>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <div className="flex flex-col justify-end h-full">

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
