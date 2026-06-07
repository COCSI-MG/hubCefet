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

export type EventDateStatus = "upcoming" | "started" | "ended";

export function getEventDateStatus(
  start_at: string,
  end_at?: string | null
): EventDateStatus {
  const now = new Date();
  const start = new Date(start_at);

  if (now < start) {
    return "upcoming";
  }

  if (end_at && now > new Date(end_at)) {
    return "ended";
  }

  return "started";
}

export function isEventOngoing(
  start_at: string,
  end_at?: string | null
): boolean {
  return getEventDateStatus(start_at, end_at) === "started";
}

export const menuRoutes = [
  "/docflow/events",
  "/docflow/events/create",
  "/docflow/events/all",
  "/docflow/profile",
];

export const superUsersProfiles = Object.keys(Profile).filter(
  (profile) => profile !== Profile.Student && profile !== Profile.User,
);
