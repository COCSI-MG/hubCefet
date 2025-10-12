/**
 * Geofencing utility functions for location-based validation
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param coord1 First coordinate (user location)
 * @param coord2 Second coordinate (event location)
 * @returns Distance in meters
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates,
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check if user coordinates are within the geofence radius of an event
 * @param userLocation User's current coordinates
 * @param eventLocation Event's coordinates
 * @param radiusInMeters Allowed radius in meters
 * @returns true if user is within the geofence, false otherwise
 */
export function isWithinGeofence(
  userLocation: Coordinates,
  eventLocation: Coordinates,
  radiusInMeters: number,
): boolean {
  const distance = calculateDistance(userLocation, eventLocation);
  return distance <= radiusInMeters;
}

/**
 * Validate latitude and longitude values
 * @param lat Latitude value
 * @param lng Longitude value
 * @returns true if coordinates are valid, false otherwise
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
