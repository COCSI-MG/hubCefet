import { toast } from "sonner";
import {
  createPresence as createPresenceOriginal,
  patchPresence as patchPresenceOriginal,
} from "@/api/data/presence.data";
import { checkGeolocationPermission } from "@/lib/utils/geolocation";
import type { PresenceCreate, Presence } from "@/lib/types";

/**
 * Enhanced presence creation with geolocation feedback
 */
export const createPresenceWithGeolocation = async (
  data: PresenceCreate,
  coordinates?: { latitude: number; longitude: number }
): Promise<Presence | boolean> => {
  // Proceed with creating presence with coordinates if provided
  const result = await createPresenceOriginal(data, coordinates);

  if (result && typeof result === "object") {
    toast.success("Presença criada com sucesso!");
  } else if (result === false) {
    toast.error("Erro ao criar presença. Tente novamente.");
  }

  return result;
};

/**
 * Enhanced presence update with geolocation feedback
 */
export const patchPresenceWithGeolocation = async (
  id: string,
  data: PresenceCreate,
  coordinates?: { latitude: number; longitude: number }
): Promise<Presence | undefined> => {
  // Proceed with updating presence with coordinates if provided
  const result = await patchPresenceOriginal(id, data, coordinates);

  if (result) {
    toast.success("Presença atualizada com sucesso!");
  } else {
    toast.error("Erro ao atualizar presença. Tente novamente.");
  }

  return result;
};

/**
 * Show location permission prompt to user
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const permission = await checkGeolocationPermission();

    if (permission === "denied") {
      toast.error(
        "Acesso à localização foi negado. Habilite nas configurações do navegador.",
        {
          duration: 6000,
          action: {
            label: "Instruções",
            onClick: () => {
              toast.info(
                "Chrome: Clique no ícone de cadeado na barra de endereços e habilite a localização.",
                { duration: 10000 }
              );
            },
          },
        }
      );
      return false;
    }

    if (permission === "granted") {
      toast.success("Localização já está habilitada!");
      return true;
    }

    // If prompt, the browser will ask for permission when needed
    toast.info(
      "O navegador solicitará acesso à localização quando necessário."
    );
    return true;
  } catch (error) {
    toast.error("Erro ao verificar permissões de localização.");
    console.error("Location permission error:", error);
    return false;
  }
};
