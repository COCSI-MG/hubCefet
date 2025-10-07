// Centralized profile constants for consistent usage across the app
import { Profile } from '@/lib/enum/profile.enum';

export const PROFILE_NAMES = {
  ADMIN: Profile.Admin,
  PROFESSOR: Profile.Professor, 
  STUDENT: Profile.Student,
  USER: Profile.User
} as const;

export const PROFILE_DISPLAY_NAMES = {
  [PROFILE_NAMES.ADMIN]: 'Admin',
  [PROFILE_NAMES.PROFESSOR]: 'Professor',
  [PROFILE_NAMES.STUDENT]: 'Estudante', 
  [PROFILE_NAMES.USER]: 'Usuário'
} as const;

export const PROFILE_STYLES = {
  [PROFILE_NAMES.ADMIN]: 'bg-red-100 text-red-800',
  [PROFILE_NAMES.PROFESSOR]: 'bg-purple-100 text-purple-800',
  [PROFILE_NAMES.STUDENT]: 'bg-green-100 text-green-800',
  [PROFILE_NAMES.USER]: 'bg-sky-100 text-sky-800'
} as const;

// Default style for unknown profiles
export const DEFAULT_PROFILE_STYLE = 'bg-gray-100 text-gray-800';

// Utility function to get profile style by name
export function getProfileStyle(profileName: string): string {
  const normalizedName = profileName.toLowerCase();
  
  // Check if the profile name contains any of our known profile types
  for (const value of Object.values(PROFILE_NAMES)) {
    if (normalizedName.includes(value)) {
      return PROFILE_STYLES[value as keyof typeof PROFILE_STYLES];
    }
  }
  
  return DEFAULT_PROFILE_STYLE;
}

// Utility function to get display name
export function getProfileDisplayName(profileName: string): string {
  const normalizedName = profileName.toLowerCase();
  
  // Check if the profile name matches any of our known profile types
  for (const value of Object.values(PROFILE_NAMES)) {
    if (normalizedName.includes(value) || normalizedName === value) {
      return PROFILE_DISPLAY_NAMES[value as keyof typeof PROFILE_DISPLAY_NAMES];
    }
  }
  
  // Return original name if no match found (capitalized)
  return profileName.charAt(0).toUpperCase() + profileName.slice(1);
}