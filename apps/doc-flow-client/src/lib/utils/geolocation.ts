/**
 * Geolocation utility for getting user coordinates
 */

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

/**
 * Get the user's current position using the Geolocation API
 * @param options Optional configuration for geolocation
 * @returns Promise with coordinates or throws error
 */
export const getCurrentPosition = (
  options?: PositionOptions
): Promise<GeolocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: "Geolocation is not supported by this browser",
      });
      return;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 300000, // 5 minutes cache
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let message = "Unknown error occurred";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "User denied the request for Geolocation.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message = "The request to get user location timed out.";
            break;
        }
        reject({
          code: error.code,
          message,
        });
      },
      defaultOptions
    );
  });
};

/**
 * Watch the user's position and call callback on changes
 * @param callback Function to call when position changes
 * @param options Optional configuration for geolocation
 * @returns Watch ID that can be used to clear the watch
 */
export const watchPosition = (
  callback: (coordinates: GeolocationCoordinates) => void,
  errorCallback?: (error: GeolocationError) => void,
  options?: PositionOptions
): number => {
  if (!navigator.geolocation) {
    if (errorCallback) {
      errorCallback({
        code: 0,
        message: "Geolocation is not supported by this browser",
      });
    }
    return -1;
  }

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000, // 10 seconds
    maximumAge: 60000, // 1 minute cache for watch
    ...options,
  };

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    (error) => {
      if (errorCallback) {
        let message = "Unknown error occurred";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "User denied the request for Geolocation.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message = "The request to get user location timed out.";
            break;
        }
        errorCallback({
          code: error.code,
          message,
        });
      }
    },
    defaultOptions
  );
};

/**
 * Clear a geolocation watch
 * @param watchId The ID returned by watchPosition
 */
export const clearWatch = (watchId: number): void => {
  if (navigator.geolocation && watchId !== -1) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * Check if geolocation is supported and permissions are granted
 * @returns Promise with permission state
 */
export const checkGeolocationPermission =
  async (): Promise<PermissionState> => {
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported by this browser");
    }

    if (!navigator.permissions) {
      // Fallback for browsers that don't support permissions API
      // Try to get position to check if it works
      try {
        await getCurrentPosition({ timeout: 1000 });
        return "granted";
      } catch {
        return "denied";
      }
    }

    const permission = await navigator.permissions.query({
      name: "geolocation",
    });
    return permission.state;
  };
