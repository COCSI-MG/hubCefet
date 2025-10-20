import { useState, useEffect, useCallback } from "react";
import {
  getCurrentPosition,
  checkGeolocationPermission,
  type GeolocationCoordinates,
  type GeolocationError,
} from "@/lib/utils/geolocation";

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

interface UseGeolocationReturn {
  coordinates: GeolocationCoordinates | null;
  error: GeolocationError | null;
  loading: boolean;
  permission: PermissionState | null;
  requestLocation: () => Promise<void>;
  clearError: () => void;
}

/**
 * React hook for managing geolocation state and permissions
 */
export const useGeolocation = (
  options: UseGeolocationOptions = {}
): UseGeolocationReturn => {
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(
    null
  );
  const [error, setError] = useState<GeolocationError | null>(null);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<PermissionState | null>(null);

  // Check permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const permissionState = await checkGeolocationPermission();
        setPermission(permissionState);
      } catch {
        setError({
          code: 0,
          message: "Failed to check geolocation permission",
        });
      }
    };

    checkPermission();
  }, []);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const coords = await getCurrentPosition({
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 10000,
        maximumAge: options.maximumAge ?? 300000,
      });

      setCoordinates(coords);
      setPermission("granted");
    } catch (err) {
      const geolocationError = err as GeolocationError;
      setError(geolocationError);

      // Update permission state based on error
      if (geolocationError.code === 1) {
        setPermission("denied");
      }
    } finally {
      setLoading(false);
    }
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    coordinates,
    error,
    loading,
    permission,
    requestLocation,
    clearError,
  };
};

/**
 * Hook specifically for presence-related geolocation
 * Provides better error handling and user messaging
 */
export const usePresenceGeolocation = () => {
  const {
    coordinates,
    error,
    loading,
    permission,
    requestLocation,
    clearError,
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000, // Longer timeout for presence
    maximumAge: 60000, // 1 minute cache
  });

  const getLocationForPresence = useCallback(async (): Promise<{
    success: boolean;
    coordinates?: GeolocationCoordinates;
    error?: string;
  }> => {
    try {
      await requestLocation();

      if (coordinates) {
        return {
          success: true,
          coordinates,
        };
      }

      return {
        success: false,
        error: "Location not available",
      };
    } catch {
      const errorMessage = error?.message || "Failed to get location";
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [requestLocation, coordinates, error]);

  const getErrorMessage = useCallback(() => {
    if (!error) return null;

    switch (error.code) {
      case 1:
        return "Acesso à localização negado. Por favor, habilite a localização nas configurações do navegador.";
      case 2:
        return "Localização indisponível. Verifique se o GPS está ativado.";
      case 3:
        return "Tempo limite para obter localização esgotado. Tente novamente.";
      default:
        return "Erro ao obter localização. Verifique se a localização está habilitada.";
    }
  }, [error]);

  return {
    coordinates,
    error,
    loading,
    permission,
    getLocationForPresence,
    clearError,
    errorMessage: getErrorMessage(),
  };
};
