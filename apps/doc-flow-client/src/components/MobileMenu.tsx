"use client";

import * as React from "react";
import { Link } from "react-router";
import { Menu, User, Calendar, CalendarPlus, File } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import useProfile from "@/hooks/useProfile";

export function MobileMenu() {
  const [open, setOpen] = React.useState(false);
  const { isUserProfileAdminOrProfessor } = useProfile();

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
                to={`/docflow/profile`}
                className="flex items-center space-x-2 text-sm font-medium"
                onClick={() => setOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>Perfil</span>
              </Link>
              {isUserProfileAdminOrProfessor && (
                <Link
                  to={`/docflow/events/create`}
                  className="flex items-center space-x-2 text-sm font-medium"
                  onClick={() => setOpen(false)}
                >
                  <CalendarPlus className="h-5 w-5" />
                  <span>Criar evento</span>
                </Link>
              )}
              <Link
                to={`/docflow/events/all`}
                className="flex items-center space-x-2 text-sm font-medium"
                onClick={() => setOpen(false)}
              >
                <Calendar className="h-5 w-5" />
                <span>Ver todos eventos</span>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
      <File />
    </header>
  );
}
