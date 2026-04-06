import type { UserProfile } from '../-api/useUserProfile';

const PROFILE_STORAGE_KEY = 'user_profile_cache';

export function getCachedProfile() {
  try {
    const cached = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached) as UserProfile;
    }
  } catch {
    // Ignore JSON parse errors
  }
  return null;
}

export function setCachedProfile(profile: UserProfile | null): void {
  try {
    if (profile) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function updateProfileCache(updates: Partial<UserProfile>): void {
  try {
    const cached = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (cached) {
      const profile = JSON.parse(cached) as UserProfile;
      const updated = {
        ...profile,
        ...updates,
      };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch {
    // Ignore errors
  }
}
