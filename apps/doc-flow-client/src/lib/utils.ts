import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Profile } from "./enum/profile.enum";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getEventsStatusText(status: string): string {
  let statusAsString: string;

  switch (status) {
    case "upcoming":
      statusAsString = "Próximo";
      break;
    case "started":
      statusAsString = "Em andamento";
      break;
    case "ended":
      statusAsString = "Finalizado";
      break;
    default:
      statusAsString = "Desconhecido";
  }
  return statusAsString;
}

export const menuRoutes = [
  "/docflow/events",
  "/docflow/events/create",
  "/docflow/events/all",
  "/docflow/profile",
  "/docflow/files",
  "/docflow/files/create",
];

export const superUsersProfiles = Object.keys(Profile).filter(
  (profile) => profile !== Profile.Student && profile !== Profile.User,
);
