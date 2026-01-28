export interface ProfileCacheData {
  nickname: string | null;
  profile_logo: string | null;
  last_changed?: string | null;
}

const PROFILE_STORAGE_KEY = "user_profile_cache";

export function getCachedProfile(): ProfileCacheData | null {
  try {
    const cached = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached) as ProfileCacheData;
    }
  } catch {
    // Ignore JSON parse errors
  }
  return null;
}

export function setCachedProfile(profile: ProfileCacheData | null): void {
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

export function updateProfileCache(updates: Partial<ProfileCacheData>): void {
  try {
    const cached = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (cached) {
      const profile = JSON.parse(cached) as ProfileCacheData;
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
